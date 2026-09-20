import { spawn } from "node:child_process";
import path from "node:path";
import fs from "node:fs";
import fsp from "node:fs/promises";
import { BrowserWindow, ipcMain } from "electron";
import {
  getMinecraftDir,
  readInstance,
  setInstanceStatus,
} from "./instanceManager";
import { JavaService } from "./javaService";
import { formatUuidWithDashes, getAccountCredentials } from "./auth";
import { Titles } from "prismarine-auth";

export class LaunchService {
  private async extractNatives(
    libs: any[],
    librariesDir: string,
    nativesDir: string,
  ): Promise<void> {
    const currentOs =
      process.platform === "win32"
        ? "windows"
        : process.platform === "darwin"
          ? "osx"
          : "linux";

    const AdmZip = (await import("adm-zip")).default;

    for (const lib of libs) {
      const nativesKey: string | undefined = lib.natives?.[currentOs];
      if (!nativesKey) continue;

      const resolvedKey = nativesKey.replace(
        "${arch}",
        process.arch === "x64" ? "64" : "32",
      );
      const classifier = lib.downloads?.classifiers?.[resolvedKey];
      if (!classifier) continue;

      const jarPath = path.join(librariesDir, classifier.path);
      if (!fs.existsSync(jarPath)) {
        console.warn(`[Launcher] Нативный jar отсутствует: ${jarPath}`);
        continue;
      }

      // Манифест может просить не распаковывать часть файлов
      const excludes: string[] = lib.extract?.exclude ?? [];

      const zip = new AdmZip(jarPath);
      for (const entry of zip.getEntries()) {
        if (entry.isDirectory) continue;
        const name = entry.entryName;

        if (name.startsWith("META-INF/")) continue;
        if (excludes.some((ex) => name.startsWith(ex))) continue;

        // Кладём плоско: LWJGL ищет библиотеки прямо в java.library.path
        const dest = path.join(nativesDir, path.basename(name));
        if (fs.existsSync(dest)) continue; // уже распаковано с прошлого запуска

        await fsp.writeFile(dest, entry.getData());
      }
    }
  }

  private javaService: JavaService;

  constructor() {
    this.javaService = new JavaService();
  }

  public async launch(instanceId: string, win?: BrowserWindow): Promise<void> {
    const t0 = performance.now();
    console.log(
      `\n================== INSTANCE LAUNCHING: ${instanceId} ==================`,
    );

    const instance = await readInstance(instanceId);
    const mcDir = getMinecraftDir(instanceId);
    const versionsDir = path.join(mcDir, "versions");
    const librariesDir = path.join(mcDir, "libraries");
    const assetsDir = path.join(mcDir, "assets");

    // 1. Определение файлов версий
    const isFabric = instance.modloader === "fabric";
    const versionId = isFabric
      ? `fabric-loader-${instance.modloaderVersion}-${instance.minecraftVersion}`
      : instance.minecraftVersion;

    const versionJsonPath = path.join(
      versionsDir,
      versionId,
      `${versionId}.json`,
    );
    const vanillaJsonPath = path.join(
      versionsDir,
      instance.minecraftVersion,
      `${instance.minecraftVersion}.json`,
    );

    const targetJsonPath = fs.existsSync(versionJsonPath)
      ? versionJsonPath
      : vanillaJsonPath;
    if (!fs.existsSync(targetJsonPath)) {
      throw new Error(`Манифест версии не найден: ${targetJsonPath}`);
    }

    const versionData = JSON.parse(await fsp.readFile(targetJsonPath, "utf-8"));

    let vanillaData: any = null;
    if (isFabric && fs.existsSync(vanillaJsonPath)) {
      vanillaData = JSON.parse(await fsp.readFile(vanillaJsonPath, "utf-8"));
    }

    const javaMajor = this.javaService.getRecommendedJavaVersion(
      instance.minecraftVersion,
      vanillaData || versionData,
    );

    // 2. Быстрое получение Java и токена аккаунта
    const [javaPath, credentials] = await Promise.all([
      this.javaService.ensureJava(javaMajor),
      getAccountCredentials(),
    ]);

    // 3. Формирование Classpath
    const classpathEntries: string[] = [];
    const resolveLibs = (libs: any[]) => {
      for (const lib of libs) {
        if (lib.downloads?.artifact) {
          classpathEntries.push(
            path.join(librariesDir, lib.downloads.artifact.path),
          );
        } else if (lib.name) {
          const parts = lib.name.split(":");
          classpathEntries.push(
            path.join(
              librariesDir,
              ...parts[0].split("."),
              parts[1],
              parts[2],
              `${parts[1]}-${parts[2]}.jar`,
            ),
          );
        }
      }
    };

    resolveLibs(versionData.libraries || []);
    if (isFabric && vanillaData) resolveLibs(vanillaData.libraries || []);

    const clientJar = path.join(
      versionsDir,
      instance.minecraftVersion,
      `${instance.minecraftVersion}.jar`,
    );
    if (fs.existsSync(clientJar)) classpathEntries.push(clientJar);

    const cpSeparator = process.platform === "win32" ? ";" : ":";
    const fullClasspath = classpathEntries
      .filter((p) => fs.existsSync(p))
      .join(cpSeparator);

    // 4. Оптимизированные аргументы JVM
    const nativesDir = path.join(mcDir, "natives");
    await fsp.mkdir(nativesDir, { recursive: true });

    await this.extractNatives(
      versionData.libraries || [],
      librariesDir,
      nativesDir,
    );
    if (isFabric && vanillaData) {
      await this.extractNatives(
        vanillaData.libraries || [],
        librariesDir,
        nativesDir,
      );
    }

    const jvmArgs = [
      // Быстрый старт с 512M и потолок до 3G
      "-Xms512M",
      "-Xmx3G",

      // Быстрый сборщик мусора G1GC
      "-XX:+UnlockExperimentalVMOptions",
      "-XX:+UseG1GC",
      "-XX:G1NewSizePercent=20",
      "-XX:G1ReservePercent=20",
      "-XX:MaxGCPauseMillis=50",
      "-XX:G1HeapRegionSize=32M",

      // Пути к нативным библиотекам игры
      `-Djava.library.path=${nativesDir}`,
      `-Djna.tmpdir=${nativesDir}`,
      `-Dorg.lwjgl.system.SharedLibraryExtractPath=${nativesDir}`,
      `-Dio.netty.native.workdir=${nativesDir}`,
      "-Dminecraft.launcher.brand=nimbus-launcher",
      "-Dminecraft.launcher.version=1.0.0",

      // Передаем Classpath напрямую
      "-cp",
      fullClasspath,

      versionData.mainClass,
    ];

    // 5. Игровые аргументы
    const gameArgsTemplate: string[] = [];
    if (versionData.minecraftArguments) {
      gameArgsTemplate.push(...versionData.minecraftArguments.split(" "));
    } else if (versionData.arguments?.game) {
      for (const a of versionData.arguments.game) {
        if (typeof a === "string") gameArgsTemplate.push(a);
      }
    }
    const replacements: Record<string, string> = {
      "${auth_player_name}": credentials.username,
      "${version_name}": versionId,
      "${game_directory}": mcDir,
      "${assets_root}": assetsDir,
      "${assets_index_name}":
        versionData.assetIndex?.id ||
        (vanillaData?.assetIndex?.id ?? instance.minecraftVersion),
      "${auth_uuid}": formatUuidWithDashes(credentials.uuid),
      "${auth_access_token}": credentials.accessToken,
      "${user_type}": credentials.userType,
      "${version_type}": "release",
      "${clientid}": Titles.MinecraftNintendoSwitch,
    };

    if (credentials.xuid) {
      replacements["${auth_xuid}"] = credentials.xuid;
    }

    const finalGameArgs: string[] = [];
    for (let i = 0; i < gameArgsTemplate.length; i++) {
      const arg = gameArgsTemplate[i];
      if (arg === "${auth_xuid}" && !credentials.xuid) {
        finalGameArgs.pop(); // убираем предыдущий "--xuid"
        continue;
      }
      let res = arg;
      for (const [k, v] of Object.entries(replacements))
        res = res.split(k).join(v);
      finalGameArgs.push(res);
    }

    const fullArgs = [...jvmArgs, ...finalGameArgs];

    const prepTime = ((performance.now() - t0) / 1000).toFixed(2);
    console.log(
      `>>> [Launcher] Preparing last ${prepTime}s. Launching Minecraft...`,
    );

    console.log(
      "[Launcher] username:",
      JSON.stringify(credentials.username),
      credentials.username?.length,
    );
    console.log("[Launcher] uuid:", JSON.stringify(credentials.uuid));
    console.log(
      "[Launcher] args:",
      finalGameArgs
        .map((a) => (a === credentials.accessToken ? "<TOKEN>" : a))
        .join(" "),
    );

    // 6. Запуск процесса
    const gameProcess = spawn(javaPath, fullArgs, {
      cwd: mcDir,
      detached: false,
    });

    gameProcess.stdout.on("data", (data) => {
      const msg = data.toString();
      console.log(`[MC STDOUT]: ${msg}`);
      win?.webContents.send("game:log", { instanceId, log: msg });
    });

    gameProcess.stderr.on("data", (data) => {
      const msg = data.toString();
      console.error(`[MC STDERR]: ${msg}`);
      win?.webContents.send("game:log", { instanceId, log: msg, error: true });
    });

    gameProcess.on("exit", async (code) => {
      console.log(`[Launcher] Game was closed with code: ${code}`);
      if (code !== 0) {
        await setInstanceStatus(instanceId, "crushed");
        win?.webContents.send("game:crashed", { instanceId, exitCode: code });
      } else {
        await setInstanceStatus(instanceId, "installed");
        win?.webContents.send("game:closed", { instanceId });
      }
    });
  }
}

export function registerLaunchHandlers(mainWindow: BrowserWindow): void {
  const launcher = new LaunchService();
  ipcMain.handle("instance:launch", async (_, instanceId: string) => {
    return await launcher.launch(instanceId, mainWindow);
  });
}
