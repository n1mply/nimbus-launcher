import { spawn } from "node:child_process";
import path from "node:path";
import fs from "node:fs";
import fsp from "node:fs/promises";
import { DownloadManager } from "./downloadManager";

interface InstallOptions {
  mcDir: string;
  modloader: "forge" | "neoforge";
  mcVersion: string;
  loaderVersion: string | null;
  javaPath: string;
  signal?: AbortSignal;
  onLog?: (line: string) => void;
}

export class LoaderInstaller {
  constructor(private dm: DownloadManager) {}

  private installerUrl(loader: string, mcVersion: string, v: string): string {
    if (loader === "neoforge") {
      return `https://maven.neoforged.net/releases/net/neoforged/neoforge/${v}/neoforge-${v}-installer.jar`;
    }
    const full = `${mcVersion}-${v}`;
    return `https://maven.minecraftforge.net/net/minecraftforge/forge/${full}/forge-${full}-installer.jar`;
  }

  /** Возвращает id установленного профиля версии (имя папки в versions/) */
  public async install(o: InstallOptions): Promise<string> {
    if (!o.loaderVersion) throw new Error(`${o.modloader}: loader version not specified`);

    const installerPath = path.join(
      o.mcDir, "installers", `${o.modloader}-${o.mcVersion}-${o.loaderVersion}-installer.jar`,
    );
    if (!fs.existsSync(installerPath)) {
      await this.dm.downloadFile(
        { url: this.installerUrl(o.modloader, o.mcVersion, o.loaderVersion), targetPath: installerPath, size: 0 },
        o.signal,
      );
    }

    const AdmZip = (await import("adm-zip")).default;
    const zip = new AdmZip(installerPath);

    // Считываем install_profile.json
    const profileEntry = zip.getEntry("install_profile.json");
    if (!profileEntry) throw new Error("Invalid installer: missing install_profile.json");
    const profile = JSON.parse(zip.readAsText(profileEntry));

    const versionId: string | undefined =
      profile.version ?? profile.versionInfo?.id ?? profile.install?.version;
    if (!versionId) throw new Error("Failed to determine version id from install_profile.json");

    const versionDir = path.join(o.mcDir, "versions", versionId);
    const marker = path.join(versionDir, ".nimbus-installed");
    if (fs.existsSync(marker)) return versionId; // уже установлено

    // Проверяем версию Minecraft (Forge < 1.13 не поддерживает CLI --installClient)
    const match = o.mcVersion.match(/^1\.(\d+)/);
    const minorVersion = match ? parseInt(match[1], 10) : 0;
    const isLegacyForge = o.modloader === "forge" && minorVersion < 13;

    if (isLegacyForge) {
      // ─── УСТАНОВКА СТАРОГО FORGE (<= 1.12.2) ───────────────────────────────
      o.onLog?.("Extracting Legacy Forge profile...");
      await fsp.mkdir(versionDir, { recursive: true });

      const versionJsonPath = path.join(versionDir, `${versionId}.json`);
      const versionInfo = profile.versionInfo ?? profile;
      await fsp.writeFile(versionJsonPath, JSON.stringify(versionInfo, null, 2), "utf-8");

      const librariesDir = path.join(o.mcDir, "libraries");

      // Находим universal jar файл самого Forge внутри архива инсталлера
      const bundledFileName = profile.install?.filePath;
      const forgeZipEntry =
        (bundledFileName ? zip.getEntry(bundledFileName) : null) ||
        zip.getEntries().find((e: any) => e.name.endsWith(".jar") && e.name.includes("universal")) ||
        zip.getEntries().find((e: any) => e.name.endsWith(".jar") && e.name.includes("forge"));

      // Раскладываем библиотеки по Maven-путям
      for (const lib of versionInfo.libraries || []) {
        if (!lib.name) continue;
        const [g, a, v, c] = lib.name.split(":");
        const jarName = c ? `${a}-${v}-${c}.jar` : `${a}-${v}.jar`;
        const relPath = [...g.split("."), a, v, jarName].join("/");
        const targetLibPath = path.join(librariesDir, ...relPath.split("/"));

        // Если это библиотека самого Forge — сохраняем универсальный jar из инсталлера
        if (g === "net.minecraftforge" && a === "forge") {
          if (forgeZipEntry) {
            await fsp.mkdir(path.dirname(targetLibPath), { recursive: true });
            // Сохраняем и с именем jarName, и с именем из архива (на случай разных версий)
            await fsp.writeFile(targetLibPath, forgeZipEntry.getData());
            await fsp.writeFile(path.join(path.dirname(targetLibPath), forgeZipEntry.name), forgeZipEntry.getData());
            continue;
          }
        }

        if (fs.existsSync(targetLibPath)) continue;

        // Если библиотека встроена в инсталлер
        const zipEntry = zip.getEntry(jarName) || zip.getEntry(`maven/${relPath}`);
        if (zipEntry) {
          await fsp.mkdir(path.dirname(targetLibPath), { recursive: true });
          await fsp.writeFile(targetLibPath, zipEntry.getData());
          continue;
        }

        // Скачиваем библиотеку из репозитория
        const baseUrl =
          lib.url ||
          (g === "net.minecraftforge"
            ? "https://maven.minecraftforge.net/"
            : "https://libraries.minecraft.net/");
        const downloadUrl = baseUrl.replace(/\/?$/, "/") + relPath;

        try {
          await this.dm.downloadFile(
            { url: downloadUrl, targetPath: targetLibPath, size: 0 },
            o.signal,
          );
        } catch (err) {
          // Запасное зеркало Forge
          if (baseUrl !== "https://maven.minecraftforge.net/") {
            try {
              const fallbackUrl = "https://maven.minecraftforge.net/" + relPath;
              await this.dm.downloadFile(
                { url: fallbackUrl, targetPath: targetLibPath, size: 0 },
                o.signal,
              );
            } catch {
              console.warn(`Could not download library ${lib.name}`);
            }
          } else {
            console.warn(`Could not download library ${lib.name}`);
          }
        }
      }

      await fsp.writeFile(marker, "", "utf-8");
      return versionId;
    }

    // ─── СОВРЕМЕННЫЙ FORGE (>= 1.13) И NEOFORGE ──────────────────────────────
    const lp = path.join(o.mcDir, "launcher_profiles.json");
    if (!fs.existsSync(lp)) {
      await fsp.writeFile(lp, JSON.stringify({ profiles: {}, version: 3 }), "utf-8");
    }

    await new Promise<void>((resolve, reject) => {
      const child = spawn(o.javaPath, ["-jar", installerPath, "--installClient", o.mcDir], { cwd: o.mcDir });
      const tail: string[] = [];

      const onData = (d: Buffer) => {
        for (const line of d.toString().split(/\r?\n/)) {
          if (!line.trim()) continue;
          tail.push(line);
          if (tail.length > 30) tail.shift();
          o.onLog?.(line);
        }
      };
      child.stdout.on("data", onData);
      child.stderr.on("data", onData);

      const onAbort = () => {
        child.kill();
        reject(new Error("DOWNLOAD_ABORTED"));
      };
      o.signal?.addEventListener("abort", onAbort, { once: true });

      child.on("error", reject);
      child.on("close", (code) => {
        o.signal?.removeEventListener("abort", onAbort);
        if (code === 0) resolve();
        else reject(new Error(`Installer exited with code ${code}:\n${tail.join("\n")}`));
      });
    });

    if (!fs.existsSync(path.join(versionDir, `${versionId}.json`))) {
      throw new Error(`Installer finished, but profile ${versionId} was not created`);
    }

    await fsp.writeFile(marker, "", "utf-8");
    return versionId;
  }
}