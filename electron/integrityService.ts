import path from "node:path";
import fs from "node:fs";
import fsp from "node:fs/promises";
import { DownloadTask, IntegrityResult } from "../src/types";
import { DownloadManager } from "./downloadManager";

const MOJANG_MANIFEST_URL =
  "https://piston-meta.mojang.com/mc/game/version_manifest_v2.json";
const MOJANG_RESOURCES_BASE = "https://resources.download.minecraft.net";

const PROFILE_LOADERS: Record<string, { metaBase: string; idPrefix: string }> =
  {
    fabric: {
      metaBase: "https://meta.fabricmc.net/v2",
      idPrefix: "fabric-loader",
    },
    quilt: {
      metaBase: "https://meta.quiltmc.org/v3",
      idPrefix: "quilt-loader",
    },
  };

export class IntegrityService {
  private dm: DownloadManager;

  private getCurrentOs(): "windows" | "osx" | "linux" {
    return process.platform === "win32"
      ? "windows"
      : process.platform === "darwin"
        ? "osx"
        : "linux";
  }

  constructor() {
    this.dm = new DownloadManager();
  }

  private async fileNeedsDownload(
    filePath: string,
    expectedSize?: number,
    expectedSha1?: string,
  ): Promise<boolean> {
    if (!fs.existsSync(filePath)) return true;
    try {
      const stat = await fsp.stat(filePath);
      if (expectedSize && expectedSize > 0 && stat.size !== expectedSize)
        return true;
      if (expectedSha1) {
        const actualSha1 = await this.dm.computeFileSha1(filePath);
        if (actualSha1.toLowerCase() !== expectedSha1.toLowerCase())
          return true;
      }
      return false;
    } catch {
      return true;
    }
  }

  /**
   * Разрешает Mojang version.json
   */
  public async getVanillaVersionJson(
    versionId: string,
    versionsDir: string,
  ): Promise<any> {
    const targetPath = path.join(versionsDir, versionId, `${versionId}.json`);
    if (fs.existsSync(targetPath)) {
      return JSON.parse(await fsp.readFile(targetPath, "utf-8"));
    }

    const manifestRes = await fetch(MOJANG_MANIFEST_URL);
    const manifest = await manifestRes.json();
    const versionMeta = manifest.versions.find((v: any) => v.id === versionId);
    if (!versionMeta)
      throw new Error(
        `Версия Minecraft ${versionId} не найдена в манифесте Mojang`,
      );

    const versionJsonRes = await fetch(versionMeta.url);
    const versionJson = await versionJsonRes.json();

    await fsp.mkdir(path.dirname(targetPath), { recursive: true });
    await fsp.writeFile(
      targetPath,
      JSON.stringify(versionJson, null, 2),
      "utf-8",
    );
    return versionJson;
  }

  private async resolveLoaderVersion(
    metaBase: string,
    mcVersion: string,
    requested?: string | null,
  ): Promise<string> {
    if (requested) return requested;

    const res = await fetch(
      `${metaBase}/versions/loader/${encodeURIComponent(mcVersion)}`,
    );
    if (!res.ok) throw new Error(`Loader meta: HTTP ${res.status}`);

    const list: any[] = await res.json();
    if (!Array.isArray(list) || list.length === 0) {
      throw new Error(`Загрузчик не поддерживает Minecraft ${mcVersion}`);
    }
    // у Fabric есть флаг stable, у Quilt его нет — берём просто первый (самый новый)
    return (list.find((e) => e.loader?.stable) ?? list[0]).loader.version;
  }

  /**
   * Проверяет файлы игры (клиент, библиотеки, ассеты) и генерирует очередь задач
   */
  public async buildIntegrityQueue(
    minecraftDir: string,
    minecraftVersion: string,
    modloader: string = "vanilla",
    modloaderVersion?: string | null,
  ): Promise<IntegrityResult> {
    const queue: DownloadTask[] = [];
    const versionsDir = path.join(minecraftDir, "versions");
    const librariesDir = path.join(minecraftDir, "libraries");
    const assetsDir = path.join(minecraftDir, "assets");

    // 1. Получаем Vanilla Manifest
    const vanillaJson = await this.getVanillaVersionJson(
      minecraftVersion,
      versionsDir,
    );

    // 2. Клиентский JAR
    if (vanillaJson.downloads?.client) {
      const clientDownload = vanillaJson.downloads.client;
      const clientPath = path.join(
        versionsDir,
        minecraftVersion,
        `${minecraftVersion}.jar`,
      );
      if (
        await this.fileNeedsDownload(
          clientPath,
          clientDownload.size,
          clientDownload.sha1,
        )
      ) {
        queue.push({
          url: clientDownload.url,
          targetPath: clientPath,
          size: clientDownload.size,
          sha1: clientDownload.sha1,
        });
      }
    }

    // 3. Библиотеки Vanilla
    for (const lib of vanillaJson.libraries || []) {
      // Проверка правил ОС (natives и os-specific)
      if (lib.rules && !this.isRuleAllowed(lib.rules)) continue;

      if (lib.downloads?.artifact) {
        const art = lib.downloads.artifact;
        const libPath = path.join(librariesDir, art.path);
        if (await this.fileNeedsDownload(libPath, art.size, art.sha1)) {
          queue.push({
            url: art.url,
            targetPath: libPath,
            size: art.size,
            sha1: art.sha1,
          });
        }
      }

      // Нативы старого формата (LWJGL 2): lib.natives -> ключ в downloads.classifiers
      const nativesKey: string | undefined = lib.natives?.[this.getCurrentOs()];
      if (nativesKey) {
        const resolvedKey = nativesKey.replace(
          "${arch}",
          process.arch === "x64" ? "64" : "32",
        );
        const classifier = lib.downloads?.classifiers?.[resolvedKey];

        if (classifier) {
          const nativePath = path.join(librariesDir, classifier.path);
          if (
            await this.fileNeedsDownload(
              nativePath,
              classifier.size,
              classifier.sha1,
            )
          ) {
            queue.push({
              url: classifier.url,
              targetPath: nativePath,
              size: classifier.size,
              sha1: classifier.sha1,
            });
          }
        }
      }
    }

    // 4. Ассеты (Звуки, текстуры, локализации)
    if (vanillaJson.assetIndex) {
      const indexInfo = vanillaJson.assetIndex;
      const indexPath = path.join(assetsDir, "indexes", `${indexInfo.id}.json`);

      let indexData: any;
      if (
        await this.fileNeedsDownload(indexPath, indexInfo.size, indexInfo.sha1)
      ) {
        const res = await fetch(indexInfo.url);
        indexData = await res.json();
        await fsp.mkdir(path.dirname(indexPath), { recursive: true });
        await fsp.writeFile(
          indexPath,
          JSON.stringify(indexData, null, 2),
          "utf-8",
        );
      } else {
        indexData = JSON.parse(await fsp.readFile(indexPath, "utf-8"));
      }

      const objects = indexData.objects || {};
      for (const objKey of Object.keys(objects)) {
        const obj = objects[objKey];
        const hash = obj.hash;
        const subfolder = hash.substring(0, 2);
        const objPath = path.join(assetsDir, "objects", subfolder, hash);

        if (await this.fileNeedsDownload(objPath, obj.size, hash)) {
          queue.push({
            url: `${MOJANG_RESOURCES_BASE}/${subfolder}/${hash}`,
            targetPath: objPath,
            size: obj.size,
            sha1: hash,
          });
        }
      }
    }

    // 5. Обработка загрузчиков Fabric\Quilt
    let resolvedLoaderVersion: string | null = modloaderVersion ?? null;
    let launchVersionId: string | null = minecraftVersion;

    const profileCfg = PROFILE_LOADERS[modloader];
    if (profileCfg) {
      const loaderVersion = await this.resolveLoaderVersion(
        profileCfg.metaBase,
        minecraftVersion,
        modloaderVersion,
      );
      resolvedLoaderVersion = loaderVersion;

      const profileRes = await fetch(
        `${profileCfg.metaBase}/versions/loader/${minecraftVersion}/${loaderVersion}/profile/json`,
      );
      if (!profileRes.ok) {
        throw new Error(
          `Не удалось получить профиль ${modloader} (HTTP ${profileRes.status})`,
        );
      }
      const profileJson = await profileRes.json();
      launchVersionId = profileJson.id;

      const profileDir = path.join(versionsDir, profileJson.id);
      await fsp.mkdir(profileDir, { recursive: true });
      await fsp.writeFile(
        path.join(profileDir, `${profileJson.id}.json`),
        JSON.stringify(profileJson, null, 2),
        "utf-8",
      );

      for (const lib of profileJson.libraries || []) {
        const [group, artifact, ver, classifier] = lib.name.split(":");
        const jarName = classifier
          ? `${artifact}-${ver}-${classifier}.jar`
          : `${artifact}-${ver}.jar`;
        const relPath = [...group.split("."), artifact, ver, jarName].join("/");
        const libPath = path.join(librariesDir, ...relPath.split("/"));
        const baseUrl = (lib.url ?? "https://libraries.minecraft.net/").replace(
          /\/?$/,
          "/",
        );

        if (await this.fileNeedsDownload(libPath, lib.size, lib.sha1)) {
          queue.push({
            url: baseUrl + relPath,
            targetPath: libPath,
            size: lib.size ?? 0,
            sha1: lib.sha1,
          });
        }
      }
    }

    const totalBytesToDownload = queue.reduce(
      (sum, item) => sum + (item.size || 0),
      0,
    );
    
    if (modloader === "forge" || modloader === "neoforge")
      launchVersionId = null;

    return {
      queue,
      totalBytesToDownload,
      modloaderVersion: resolvedLoaderVersion,
      versionId: launchVersionId,
    };
  }

  private isRuleAllowed(rules: any[]): boolean {
    let allowed = false;
    const currentOs = this.getCurrentOs();

    for (const rule of rules) {
      let matches = true;
      if (rule.os) {
        if (rule.os.name && rule.os.name !== currentOs) matches = false;
      }
      if (rule.action === "allow") {
        if (matches) allowed = true;
      } else if (rule.action === "disallow") {
        if (matches) allowed = false;
      }
    }
    return allowed;
  }
}
