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
    if (!o.loaderVersion) throw new Error(`${o.modloader}: версия загрузчика не указана`);

    const installerPath = path.join(
      o.mcDir, "installers", `${o.modloader}-${o.mcVersion}-${o.loaderVersion}-installer.jar`,
    );
    if (!fs.existsSync(installerPath)) {
      await this.dm.downloadFile(
        { url: this.installerUrl(o.modloader, o.mcVersion, o.loaderVersion), targetPath: installerPath, size: 0 },
        o.signal,
      );
    }

    // id профиля лежит в install_profile.json внутри installer-jar
    const AdmZip = (await import("adm-zip")).default;
    const profile = JSON.parse(new AdmZip(installerPath).readAsText("install_profile.json"));
    const versionId: string | undefined = profile.version ?? profile.versionInfo?.id;
    if (!versionId) throw new Error("Не удалось определить id версии из install_profile.json");

    const versionDir = path.join(o.mcDir, "versions", versionId);
    const marker = path.join(versionDir, ".nimbus-installed");
    if (fs.existsSync(marker)) return versionId; // уже установлено

    // installer требует launcher_profiles.json в целевой папке
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
        else reject(new Error(`Installer завершился с кодом ${code}:\n${tail.join("\n")}`));
      });
    });

    if (!fs.existsSync(path.join(versionDir, `${versionId}.json`))) {
      throw new Error(`Installer отработал, но профиль ${versionId} не создан`);
    }
    await fsp.writeFile(marker, "", "utf-8");
    return versionId;
  }
}