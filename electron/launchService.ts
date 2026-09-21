import { spawn } from "node:child_process";
import os from "node:os";
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
  private rulesAllow(rules?: any[]): boolean {
    if (!rules?.length) return true;
    const osName =
      process.platform === "win32"
        ? "windows"
        : process.platform === "darwin"
          ? "osx"
          : "linux";

    let allowed = false;
    for (const r of rules) {
      if (r.features) continue; // demo, custom resolution и т.п. не включаем
      let matches = true;
      if (r.os) {
        if (r.os.name && r.os.name !== osName) matches = false;
        if (
          r.os.arch &&
          (r.os.arch === "x86"
            ? process.arch !== "ia32"
            : r.os.arch !== process.arch)
        )
          matches = false;
        if (r.os.version && !new RegExp(r.os.version).test(os.release()))
          matches = false;
      }
      if (matches) allowed = r.action === "allow";
    }
    return allowed;
  }

  private resolveArgs(list: any[], vars: Record<string, string>): string[] {
    const out: string[] = [];
    for (const a of list) {
      if (typeof a === "string") out.push(a);
      else if (this.rulesAllow(a.rules))
        out.push(...(Array.isArray(a.value) ? a.value : [a.value]));
    }
    return (
      out
        // трюк для официального лаунчера, нам не нужен (Fabric и Quilt без него работают)
        .filter((a) => !a.includes("FabricMcEmu"))
        .map((a) =>
          Object.entries(vars).reduce((s, [k, v]) => s.split(k).join(v), a),
        )
    );
  }

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

  private async loadMergedVersion(
    versionsDir: string,
    versionId: string,
  ): Promise<any> {
    const p = path.join(versionsDir, versionId, `${versionId}.json`);
    if (!fs.existsSync(p)) {
      throw new Error(
        `Манифест версии не найден: ${p}. Переустановите инстанс`,
      );
    }
    const child = JSON.parse(await fsp.readFile(p, "utf-8"));
    if (!child.inheritsFrom) return child;

    const parent = await this.loadMergedVersion(
      versionsDir,
      child.inheritsFrom,
    );
    return {
      ...parent,
      ...child,
      mainClass: child.mainClass ?? parent.mainClass,
      assetIndex: child.assetIndex ?? parent.assetIndex,
      // дочерние библиотеки первыми: при дедупликации побеждает Fabric
      libraries: [...(child.libraries ?? []), ...(parent.libraries ?? [])],
      arguments: {
        game: [
          ...(parent.arguments?.game ?? []),
          ...(child.arguments?.game ?? []),
        ],
        jvm: [
          ...(parent.arguments?.jvm ?? []),
          ...(child.arguments?.jvm ?? []),
        ],
      },
    };
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

    const LOADER_ID_PREFIX: Record<string, string> = {
      fabric: "fabric-loader",
      quilt: "quilt-loader",
    };
    const idPrefix = LOADER_ID_PREFIX[instance.modloader];

    let versionId: string | null = instance.launchVersionId ?? null;
    if (!versionId) {
      if (instance.modloader === "vanilla") {
        versionId = instance.minecraftVersion;
      } else if (idPrefix && instance.modloaderVersion) {
        versionId = `${idPrefix}-${instance.modloaderVersion}-${instance.minecraftVersion}`;
      } else {
        throw new Error(
          `${instance.modloader} is not installed properly. Reinstall the instance!`,
        );
      }
    }

    const versionData = await this.loadMergedVersion(versionsDir, versionId);

    const javaMajor = this.javaService.getRecommendedJavaVersion(
      instance.minecraftVersion,
      versionData,
    );

    // 2. Быстрое получение Java и токена аккаунта
    const [javaPath, credentials] = await Promise.all([
      this.javaService.ensureJava(javaMajor),
      getAccountCredentials(),
    ]);

    // 3. Формирование Classpath
    const classpathEntries: string[] = [];
    const seen = new Set<string>();

    for (const lib of versionData.libraries || []) {
      const key = lib.name
        ?.split(":")
        .filter((_: string, i: number) => i !== 2)
        .join(":");
      if (key) {
        if (seen.has(key)) continue;
        seen.add(key);
      }

      if (lib.downloads?.artifact) {
        classpathEntries.push(
          path.join(librariesDir, lib.downloads.artifact.path),
        );
      } else if (lib.name) {
        const [g, a, v, c] = lib.name.split(":");
        const jar = c ? `${a}-${v}-${c}.jar` : `${a}-${v}.jar`;
        classpathEntries.push(
          path.join(librariesDir, ...g.split("."), a, v, jar),
        );
      }
    }

    if (instance.modloader !== "neoforge") {
      const clientJar = path.join(
        versionsDir,
        instance.minecraftVersion,
        `${instance.minecraftVersion}.jar`,
      );
      if (fs.existsSync(clientJar)) classpathEntries.push(clientJar);
    }

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

    const profileJvm = this.resolveArgs(versionData.arguments?.jvm ?? [], {
      "${natives_directory}": nativesDir,
      "${launcher_name}": "nimbus-launcher",
      "${launcher_version}": "1.0.0",
      "${classpath}": fullClasspath,
      "${classpath_separator}": cpSeparator,
      "${library_directory}": librariesDir,
      "${version_name}": versionId,
    });

    // Старые версии (до 1.13) не имеют arguments.jvm — задаём минимум сами
    const legacyJvm = [
      `-Djava.library.path=${nativesDir}`,
      "-Dminecraft.launcher.brand=nimbus-launcher",
      "-Dminecraft.launcher.version=1.0.0",
    ];
    const hasClasspath = profileJvm.some(
      (a) => a === "-cp" || a === "-classpath",
    );

    const jvmArgs = [
      "-Xms512M",
      "-Xmx3G",
      "-XX:+UnlockExperimentalVMOptions",
      "-XX:+UseG1GC",
      "-XX:G1NewSizePercent=20",
      "-XX:G1ReservePercent=20",
      "-XX:MaxGCPauseMillis=50",
      "-XX:G1HeapRegionSize=32M",

      `-Djna.tmpdir=${nativesDir}`,
      `-Dorg.lwjgl.system.SharedLibraryExtractPath=${nativesDir}`,
      `-Dio.netty.native.workdir=${nativesDir}`,

      ...(profileJvm.length ? profileJvm : legacyJvm),
      ...(hasClasspath ? [] : ["-cp", fullClasspath]),

      versionData.mainClass,
    ];

    // 5. Игровые аргументы
    const gameArgsTemplate: string[] = [];
    if (versionData.minecraftArguments) {
      gameArgsTemplate.push(...versionData.minecraftArguments.split(" "));
    }
    for (const a of versionData.arguments?.game ?? []) {
      if (typeof a === "string") gameArgsTemplate.push(a);
    }
    const replacements: Record<string, string> = {
      "${auth_player_name}": credentials.username,
      "${version_name}": versionId,
      "${game_directory}": mcDir,
      "${assets_root}": assetsDir,
      "${assets_index_name}":
        versionData.assetIndex?.id ?? instance.minecraftVersion,
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
