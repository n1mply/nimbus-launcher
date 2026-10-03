import { app, ipcMain, shell } from "electron";
import path from "path";
import fs from "fs/promises";
import { existsSync } from "fs";

export type DeleteMode = "soft" | "hard";
export type ContentFolderType = "mod" | "resourcepack" | "shader" | "datapack";

export interface InstalledContentRecord {
  projectId: string;
  projectType: string;
  versionId?: string;
  fileName: string;
  installedAt: number;
  worldFolderName?: string;
}

export async function getInstalledContent(
  folderName: string,
): Promise<InstalledContentRecord[]> {
  const instancePath = path.join(
    app.getPath("userData"),
    "instances",
    folderName,
  );
  const manifestPath = path.join(instancePath, "installed_content.json");

  if (!existsSync(manifestPath)) return [];

  try {
    const raw = await fs.readFile(manifestPath, "utf-8");
    const records: InstalledContentRecord[] = JSON.parse(raw);

    const validRecords: InstalledContentRecord[] = [];
    for (const rec of records) {
      let filePath = "";
      if (rec.projectType === "resourcepack") {
        filePath = path.join(
          instancePath,
          "minecraft",
          "resourcepacks",
          rec.fileName,
        );
      } else if (rec.projectType === "shader") {
        filePath = path.join(
          instancePath,
          "minecraft",
          "shaderpacks",
          rec.fileName,
        );
      } else if (rec.projectType === "datapack" && rec.worldFolderName) {
        filePath = path.join(
          instancePath,
          "minecraft",
          "saves",
          rec.worldFolderName,
          "datapacks",
          rec.fileName,
        );
      } else {
        filePath = path.join(instancePath, "minecraft", "mods", rec.fileName);
      }

      if (existsSync(filePath)) validRecords.push(rec);
    }

    return validRecords;
  } catch {
    return [];
  }
}

export async function recordInstalledContent(
  folderName: string,
  record: InstalledContentRecord,
): Promise<void> {
  const instancePath = path.join(
    app.getPath("userData"),
    "instances",
    folderName,
  );
  const manifestPath = path.join(instancePath, "installed_content.json");

  let list = await getInstalledContent(folderName);
  list = list.filter((r) => {
    if (record.projectType === "datapack") {
      return !(
        r.projectId === record.projectId &&
        r.worldFolderName === record.worldFolderName
      );
    }
    return r.projectId !== record.projectId;
  });
  list.push(record);

  await fs.writeFile(manifestPath, JSON.stringify(list, null, 2), "utf-8");
}

export async function saveContentToInstance(
  folderName: string,
  type: string,
  fileName: string,
  buffer: Buffer,
  worldFolderName?: string,
): Promise<{ success: boolean; filePath?: string; error?: string }> {
  try {
    const minecraftPath = path.join(
      app.getPath("userData"),
      "instances",
      folderName,
      "minecraft",
    );

    let targetDir = "";
    switch (type) {
      case "mod":
        targetDir = path.join(minecraftPath, "mods");
        break;
      case "resourcepack":
        targetDir = path.join(minecraftPath, "resourcepacks");
        break;
      case "shader":
        targetDir = path.join(minecraftPath, "shaderpacks");
        break;
      case "datapack":
        if (!worldFolderName) {
          throw new Error("Datapack installation requires a selected world");
        }
        targetDir = path.join(
          minecraftPath,
          "saves",
          worldFolderName,
          "datapacks",
        );
        break;
      default:
        throw new Error(`Unsupported content type: ${type}`);
    }

    if (!existsSync(targetDir)) {
      await fs.mkdir(targetDir, { recursive: true });
    }

    const fullPath = path.join(targetDir, fileName);
    await fs.writeFile(fullPath, buffer);

    return { success: true, filePath: fullPath };
  } catch (error: any) {
    console.error(`[saveContentToInstance] Error:`, error);
    return { success: false, error: error.message };
  }
}

export function registerFolderHandlers() {
  // Открытие папки игры
  ipcMain.handle("folder:openInstanceFolder", async (_, folderName: string) => {
    try {
      const targetPath = path.join(
        app.getPath("userData"),
        "instances",
        folderName,
        "minecraft",
      );

      if (!existsSync(targetPath)) {
        await fs.mkdir(targetPath, { recursive: true });
      }

      const errorMessage = await shell.openPath(targetPath);

      if (errorMessage) {
        console.error("shell.openPath error:", errorMessage);
        return { success: false, error: errorMessage };
      }

      return { success: true };
    } catch (error: any) {
      console.error("File system error:", error);
      return { success: false, error: error.message };
    }
  });

  // Удаление файлов сборки
  ipcMain.handle(
    "folder:deleteInstanceFolder",
    async (
      _,
      { folderName, mode }: { folderName: string; mode: DeleteMode },
    ) => {
      try {
        const instancePath = path.join(
          app.getPath("userData"),
          "instances",
          folderName,
        );
        const minecraftPath = path.join(instancePath, "minecraft");

        if (mode === "soft") {
          // Удаляем только папку minecraft (файлы игры/моды/кэш загрузки)
          if (existsSync(minecraftPath)) {
            await fs.rm(minecraftPath, {
              recursive: true,
              force: true,
              maxRetries: 5,
              retryDelay: 200,
            });
          }
        } else if (mode === "hard") {
          // Полное удаление папки сборки вместе с instance.json
          if (existsSync(instancePath)) {
            await fs.rm(instancePath, {
              recursive: true,
              force: true,
              maxRetries: 5,
              retryDelay: 200,
            });
          }
        }

        return { success: true };
      } catch (error: any) {
        console.error(`Delete error (${mode}):`, error);
        return { success: false, error: error.message };
      }
    },
  );

  ipcMain.handle("folder:openLatestLog", async (_, folderName: string) => {
    try {
      const logPath = path.join(
        app.getPath("userData"),
        "instances",
        folderName,
        "minecraft",
        "logs",
        "latest.log",
      );

      if (!existsSync(logPath)) {
        return {
          success: false,
          error: "No logs yet — launch the instance at least once",
        };
      }

      const errorMessage = await shell.openPath(logPath);
      if (errorMessage) {
        console.error("shell.openPath error:", errorMessage);
        return { success: false, error: errorMessage };
      }

      return { success: true };
    } catch (error: any) {
      console.error("Error opening log:", error);
      return { success: false, error: error.message };
    }
  });
}
