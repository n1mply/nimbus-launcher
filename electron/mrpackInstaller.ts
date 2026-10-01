// mrpackInstaller.ts
import path from "node:path";
import fsp from "node:fs/promises";
import { app } from "electron";
import { createInstance, getInstances } from "./instances";
import { getInstanceDir, getMinecraftDir } from "./instanceManager";
import { recordInstalledContent } from "./folderActions";
import type { DownloadTask, Instance } from "../src/types";

const USER_AGENT = "n1mply/nimbus-launcher/1.0.0 (n1mply.dev@gmail.com)";
const MODRINTH_API = "https://api.modrinth.com/v2";

export interface PrepareModpackOptions {
  projectId: string;
  name: string;
  iconUrl?: string | null;
}

export class MrpackInstaller {
  public async prepareInstance(options: PrepareModpackOptions): Promise<Instance> {
    const { projectId, name, iconUrl } = options;

    const versionsRes = await fetch(`${MODRINTH_API}/project/${projectId}/version`, {
      headers: { "User-Agent": USER_AGENT },
    });
    if (!versionsRes.ok) {
      throw new Error(`Failed to fetch modpack versions: ${versionsRes.statusText}`);
    }
    const versions = await versionsRes.json();
    if (!Array.isArray(versions) || versions.length === 0) {
      throw new Error("No versions available for this modpack");
    }

    const targetVersion = versions.find((v: any) => v.version_type === "release") || versions[0];
    const mrpackFile =
      targetVersion.files.find((f: any) => f.filename.endsWith(".mrpack") || f.primary) ||
      targetVersion.files[0];

    if (!mrpackFile?.url) {
      throw new Error("No downloadable .mrpack file found in this version");
    }

    const tempDir = path.join(app.getPath("temp"), "nimbus-mrpack");
    await fsp.mkdir(tempDir, { recursive: true });
    const tempMrpackPath = path.join(tempDir, `${projectId}-${Date.now()}.mrpack`);

    const mrpackRes = await fetch(mrpackFile.url, { headers: { "User-Agent": USER_AGENT } });
    if (!mrpackRes.ok) throw new Error(`Download .mrpack failed: ${mrpackRes.statusText}`);
    const mrpackBuffer = Buffer.from(await mrpackRes.arrayBuffer());
    await fsp.writeFile(tempMrpackPath, mrpackBuffer);

    const AdmZip = (await import("adm-zip")).default;
    const zip = new AdmZip(tempMrpackPath);

    const indexEntry = zip.getEntry("modrinth.index.json");
    if (!indexEntry) {
      await fsp.rm(tempMrpackPath, { force: true });
      throw new Error("Corrupted modpack: missing modrinth.index.json");
    }

    const index = JSON.parse(zip.readAsText(indexEntry));
    const deps = index.dependencies || {};
    const minecraftVersion = deps["minecraft"];
    if (!minecraftVersion) {
      throw new Error("Modpack manifest does not specify a Minecraft version");
    }

    let modloader = "vanilla";
    let modloaderVersion: string | null = null;

    if (deps["fabric-loader"]) {
      modloader = "fabric";
      modloaderVersion = deps["fabric-loader"];
    } else if (deps["forge"]) {
      modloader = "forge";
      modloaderVersion = deps["forge"];
    } else if (deps["neoforge"]) {
      modloader = "neoforge";
      modloaderVersion = deps["neoforge"];
    } else if (deps["quilt-loader"]) {
      modloader = "quilt";
      modloaderVersion = deps["quilt-loader"];
    }

    let localIconPath: string | null = null;
    if (iconUrl) {
      try {
        const iconRes = await fetch(iconUrl, { headers: { "User-Agent": USER_AGENT } });
        if (iconRes.ok) {
          const ext = path.extname(new URL(iconUrl).pathname) || ".png";
          localIconPath = path.join(tempDir, `icon-${Date.now()}${ext}`);
          await fsp.writeFile(localIconPath, Buffer.from(await iconRes.arrayBuffer()));
        }
      } catch (e) {
        console.warn("[MrpackInstaller] Failed to fetch modpack icon:", e);
      }
    }

    const existing = await getInstances();
    const existingNames = new Set(existing.map((i) => i.name.toLowerCase()));
    const baseName = (name || index.name || "Modpack").trim();
    let uniqueName = baseName;
    let count = 1;
    while (existingNames.has(uniqueName.toLowerCase())) {
      uniqueName = `${baseName} (${count++})`;
    }

    const createResult = await createInstance({
      name: uniqueName,
      modloader,
      minecraftVersion,
      modloaderVersion,
      instanceIconPath: localIconPath,
    });

    if (!createResult.success || !createResult.data) {
      throw new Error(createResult.error || "Failed to create instance for modpack");
    }

    const instanceData = createResult.data as unknown as Instance;
    const instanceId = instanceData.id;
    const mcDir = getMinecraftDir(instanceId);
    const instanceDir = getInstanceDir(instanceId);

    for (const entry of zip.getEntries()) {
      if (entry.isDirectory) continue;
      let relPath: string | null = null;
      if (entry.entryName.startsWith("overrides/")) {
        relPath = entry.entryName.slice("overrides/".length);
      } else if (entry.entryName.startsWith("client-overrides/")) {
        relPath = entry.entryName.slice("client-overrides/".length);
      }

      if (relPath) {
        const destPath = path.join(mcDir, relPath);
        await fsp.mkdir(path.dirname(destPath), { recursive: true });
        await fsp.writeFile(destPath, entry.getData());
      }
    }

    const modpackTasks: DownloadTask[] = [];

    for (const file of index.files || []) {
      // Игнорируем серверные моды
      if (file.env?.client === "unsupported") continue;
      if (!file.downloads || file.downloads.length === 0) continue;

      const targetPath = path.join(mcDir, file.path);
      modpackTasks.push({
        url: file.downloads[0],
        targetPath,
        size: file.fileSize || 0,
        sha1: file.hashes?.sha1,
      });

      const norm = file.path.replace(/\\/g, "/");
      let type = "mod";
      if (norm.startsWith("resourcepacks/")) type = "resourcepack";
      else if (norm.startsWith("shaderpacks/")) type = "shader";

      const match = file.downloads[0].match(/\/data\/([a-zA-Z0-9]+)\/versions\//);
      const modProjId = match ? match[1] : path.basename(file.path);

      await recordInstalledContent(instanceId, {
        projectId: modProjId,
        projectType: type,
        fileName: path.basename(file.path),
        installedAt: Date.now(),
      });
    }

    const tasksFile = path.join(instanceDir, "modpack_tasks.json");
    await fsp.writeFile(tasksFile, JSON.stringify(modpackTasks, null, 2), "utf-8");

    await fsp.rm(tempMrpackPath, { force: true }).catch(() => {});
    if (localIconPath) {
      await fsp.rm(localIconPath, { force: true }).catch(() => {});
    }

    return instanceData;
  }
}