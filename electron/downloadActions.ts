import { ipcMain, BrowserWindow } from "electron";
import { IntegrityService } from "./integrityService";
import { DownloadManager } from "./downloadManager";
import { JavaService } from "./javaService";
import {
  getMinecraftDir,
  readInstance,
  setInstanceStatus,
  writeInstance,
} from "./instanceManager";
import { LoaderInstaller } from "./loaderInstaller";

const activeControllers = new Map<string, AbortController>();

export function registerDownloadActions(mainWindow: BrowserWindow): void {
  const integrityService = new IntegrityService();
  const downloadManager = new DownloadManager(8);
  const loaderInstaller = new LoaderInstaller(downloadManager);
  const javaService = new JavaService();

  ipcMain.handle("instance:install", async (_, instanceId: string) => {
    if (activeControllers.has(instanceId)) {
      throw new Error("Установка этого инстанса уже выполняется");
    }

    const abortController = new AbortController();
    activeControllers.set(instanceId, abortController);

    try {
      await setInstanceStatus(instanceId, "installing");
      const instance = await readInstance(instanceId);
      const mcDir = getMinecraftDir(instanceId);

      // 1. Подготовка Java
      mainWindow.webContents.send("download:progress", {
        instanceId,
        statusText: "Preparing Java enviroment...",
        progress: 5,
        downloadedBytes: 0,
        totalBytes: 0,
      });

      const javaMajor = javaService.getRecommendedJavaVersion(
        instance.minecraftVersion,
      );
      const javaPath = await javaService.ensureJava(javaMajor, (prog) => {
        mainWindow.webContents.send("download:progress", {
          instanceId,
          statusText: "Loading Java Runtime...",
          progress:
            prog.totalBytes > 0
              ? Math.round((prog.downloadedBytes / prog.totalBytes) * 20)
              : 10,
          downloadedBytes: prog.downloadedBytes,
          totalBytes: prog.totalBytes,
        });
      });

      // 2. Анализ целостности файлов
      mainWindow.webContents.send("download:progress", {
        instanceId,
        statusText: "File integrity check...",
        progress: 25,
        downloadedBytes: 0,
        totalBytes: 0,
      });

      const { queue, totalBytesToDownload, modloaderVersion, versionId } =
        await integrityService.buildIntegrityQueue(
          mcDir,
          instance.minecraftVersion,
          instance.modloader,
          instance.modloaderVersion,
        );

      // 3. Загрузка недостающих файлов
      if (queue.length > 0) {
        await downloadManager.downloadQueue(
          queue,
          (prog) => {
            const percent =
              totalBytesToDownload > 0
                ? Math.round(
                    25 + (prog.downloadedBytes / totalBytesToDownload) * 75,
                  )
                : 50;

            mainWindow.webContents.send("download:progress", {
              instanceId,
              statusText: `Downloading: ${prog.currentTaskName}`,
              progress: percent,
              downloadedBytes: prog.downloadedBytes,
              totalBytes: totalBytesToDownload,
            });
          },
          abortController.signal,
        );
      }

      let launchVersionId = versionId;

      if (instance.modloader === "forge" || instance.modloader === "neoforge") {
        launchVersionId = await loaderInstaller.install({
          mcDir,
          modloader: instance.modloader,
          mcVersion: instance.minecraftVersion,
          loaderVersion: modloaderVersion,
          javaPath,
          signal: abortController.signal,
          onLog: (line) =>
            mainWindow.webContents.send("download:progress", {
              instanceId,
              statusText: `Installing ${instance.modloader}: ${line.slice(0, 60)}`,
              progress: 99,
              downloadedBytes: 0,
              totalBytes: 0,
            }),
        });
      }

      await writeInstance(instanceId, { modloaderVersion, launchVersionId });

      await setInstanceStatus(instanceId, "installed");
      mainWindow.webContents.send("download:complete", { instanceId });
      return { success: true };
    } catch (err: any) {
      if (err.message === "DOWNLOAD_ABORTED") {
        await setInstanceStatus(instanceId, "empty");
        return { success: false, aborted: true };
      }
      await setInstanceStatus(instanceId, "crushed");
      mainWindow.webContents.send("download:error", {
        instanceId,
        error: err.message,
      });
      throw err;
    } finally {
      activeControllers.delete(instanceId);
    }
  });

  ipcMain.handle("instance:cancel-install", async (_, instanceId: string) => {
    const controller = activeControllers.get(instanceId);
    if (controller) {
      controller.abort();
      activeControllers.delete(instanceId);
      return { success: true };
    }
    return { success: false };
  });
}
