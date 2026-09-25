import { app, ipcMain, dialog } from "electron";
import fs from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import os from "node:os";
import type { LaunchSettings } from "../src/types";
import {
  readInstance,
  writeInstance,
  setInstanceStatus,
  getInstanceDir,
} from "./instanceManager";

export interface CreateInstancePayload {
  name: string;
  modloader: string;
  minecraftVersion: string;
  modloaderVersion: string | null;
  instanceIconPath: string | null;
}

export interface InstanceData extends CreateInstancePayload {
  id: string;
  createdAt: number;
  iconFileName: string | null;
  launchSettings?: LaunchSettings;
}

const getMimeType = (fileName: string) => {
  const ext = path.extname(fileName).toLowerCase();
  switch (ext) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    case ".svg":
      return "image/svg+xml";
    default:
      return "image/png";
  }
};

const getInstancesPath = () => path.join(app.getPath("userData"), "instances");

// Очистка имени папки от запрещенных символов
const sanitizeFolderName = (name: string) =>
  name.replace(/[<>:"/\\|?*\x00-\x1F]/g, "").trim();

export async function createInstance(payload: CreateInstancePayload) {
  const instancesDir = getInstancesPath();

  const rawName =
    payload.name || `${payload.modloader}-${payload.minecraftVersion}`;
  const folderName = sanitizeFolderName(rawName);

  if (!folderName) {
    throw new Error("Invalid instance name");
  }

  const instancePath = path.join(instancesDir, folderName);

  try {
    await fs.access(instancePath);
    return { success: false, error: "Instance with this name already exists" };
  } catch {}

  try {
    await fs.mkdir(instancePath, { recursive: true });
    await fs.mkdir(path.join(instancePath, "minecraft"), { recursive: true });

    let iconFileName = null;

    if (payload.instanceIconPath) {
      const ext = path.extname(payload.instanceIconPath) || ".png";
      iconFileName = `icon${ext}`;
      const destIconPath = path.join(instancePath, iconFileName);

      await fs.copyFile(payload.instanceIconPath, destIconPath);
    }

    const instanceData: InstanceData = {
      ...payload,
      id: folderName,
      createdAt: Date.now(),
      iconFileName,
    };

    // Сохраняем instance.json
    await fs.writeFile(
      path.join(instancePath, "instance.json"),
      JSON.stringify(instanceData, null, 2),
      "utf-8",
    );

    return { success: true, data: instanceData };
  } catch (error) {
    console.error("Failed to create instance:", error);
    return { success: false, error: String(error) };
  }
}

export async function getInstances() {
  const instancesDir = getInstancesPath();

  try {
    await fs.access(instancesDir);
  } catch {
    return [];
  }

  const folders = await fs.readdir(instancesDir, { withFileTypes: true });
  const instances = [];

  for (const dirent of folders) {
    if (dirent.isDirectory()) {
      const instanceFolderPath = path.join(instancesDir, dirent.name);
      const dataPath = path.join(instanceFolderPath, "instance.json");

      try {
        const fileContent = await fs.readFile(dataPath, "utf-8");
        const instanceData = JSON.parse(fileContent);

        let instanceIconPath: string | null = null;

        if (instanceData.iconFileName) {
          const fullIconPath = path.join(
            instanceFolderPath,
            instanceData.iconFileName,
          );
          try {
            const imageBuffer = await fs.readFile(fullIconPath);
            const mimeType = getMimeType(instanceData.iconFileName);
            instanceIconPath = `data:${mimeType};base64,${imageBuffer.toString("base64")}`;
          } catch (e) {
            console.warn(`Could not load icon for ${dirent.name}:`, e);
          }
        }

        instances.push({
          ...instanceData,
          instanceIconPath,
        });
      } catch (e) {
        console.warn(
          `Skipped ${dirent.name}: instance.json is missing or invalid`,
        );
      }
    }
  }

  return instances.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

export async function renameInstance(instanceId: string, newName: string) {
  const instancePath = path.join(getInstancesPath(), instanceId);
  const dataPath = path.join(instancePath, "instance.json");

  const trimmed = newName.trim();
  if (!trimmed) {
    return { success: false, error: "Name cannot be empty" };
  }

  try {
    const fileContent = await fs.readFile(dataPath, "utf-8");
    const instanceData: InstanceData = JSON.parse(fileContent);

    instanceData.name = trimmed; // id и папка не трогаются вообще

    await fs.writeFile(
      dataPath,
      JSON.stringify(instanceData, null, 2),
      "utf-8",
    );
    return { success: true, data: instanceData };
  } catch (error) {
    console.error("Failed to rename instance:", error);
    return { success: false, error: String(error) };
  }
}

const RAM_FLOOR_MB = 512;
const WINDOW_MIN = 320;
const WINDOW_MAX = 7680;

export interface UpdateInstanceSettingsPayload {
  name?: string;
  /** null — удалить иконку, undefined — не трогать */
  iconSourcePath?: string | null;
  launchSettings?: {
    memory?: { minMb: number; maxMb: number } | null;
    java?: { mode: "auto" | "custom"; path?: string } | null;
    jvmArgs?: string | null;
  };
}

export async function updateInstanceSettings(
  instanceId: string,
  patch: UpdateInstanceSettingsPayload,
) {
  const instancePath = getInstanceDir(instanceId);

  try {
    const current = (await readInstance(instanceId)) as InstanceData;
    const update: Partial<InstanceData> = {};

    // ── имя ──
    if (patch.name !== undefined) {
      const trimmed = patch.name.trim();
      if (!trimmed) return { success: false, error: "Name cannot be empty" };
      update.name = trimmed;
    }

    // ── иконка ──
    if (patch.iconSourcePath !== undefined) {
      if (current.iconFileName) {
        await fs
          .rm(path.join(instancePath, current.iconFileName), { force: true })
          .catch(() => {});
      }
      if (patch.iconSourcePath === null) {
        update.iconFileName = null;
      } else {
        const ext = path.extname(patch.iconSourcePath) || ".png";
        const iconFileName = `icon${ext}`;
        await fs.copyFile(
          patch.iconSourcePath,
          path.join(instancePath, iconFileName),
        );
        update.iconFileName = iconFileName;
      }
    }

    // ── launchSettings: глубокий мердж по секциям ──
    if (patch.launchSettings) {
      const merged: LaunchSettings = { ...(current.launchSettings ?? {}) };
      const ls = patch.launchSettings;

      if (ls.memory !== undefined) {
        if (ls.memory === null) {
          delete merged.memory;
        } else {
          const { minMb, maxMb } = ls.memory;
          const totalMb = Math.floor(os.totalmem() / (1024 * 1024));
          if (!(minMb >= RAM_FLOOR_MB && minMb <= maxMb && maxMb <= totalMb)) {
            return { success: false, error: "Invalid memory range" };
          }
          merged.memory = { minMb, maxMb };
        }
      }

      if (ls.java !== undefined) {
        if (ls.java === null) {
          delete merged.java;
        } else if (ls.java.mode === "custom") {
          if (!ls.java.path || !existsSync(ls.java.path)) {
            return { success: false, error: "Java path does not exist" };
          }
          merged.java = { mode: "custom", path: ls.java.path };
        } else {
          merged.java = { mode: "auto" };
        }
      }

      if (ls.jvmArgs !== undefined) {
        if (!ls.jvmArgs) delete merged.jvmArgs;
        else merged.jvmArgs = ls.jvmArgs;
      }

      update.launchSettings = merged;
    }

    // писать нечего — просто отдаём текущее состояние
    if (Object.keys(update).length === 0) {
      return { success: true, data: current };
    }

    const saved = await writeInstance(instanceId, update as any);
    return { success: true, data: saved };
  } catch (error) {
    console.error("Failed to update instance settings:", error);
    return { success: false, error: String(error) };
  }
}

export async function setInstanceLoaderVersion(
  instanceId: string,
  newVersion: string,
) {
  try {
    const current = await readInstance(instanceId);
    if (current.modloader === "vanilla") {
      return { success: false, error: "Vanilla has no loader version" };
    }
    const saved = await writeInstance(instanceId, {
      modloaderVersion: newVersion,
      launchVersionId: null, // старый launchVersionId больше не актуален
    } as any);
    await setInstanceStatus(instanceId, "empty");
    return { success: true, data: saved };
  } catch (error) {
    console.error("Failed to set loader version:", error);
    return { success: false, error: String(error) };
  }
}

export async function isInstanceInstalled(
  instanceId: string,
): Promise<boolean> {
  const minecraftPath = path.join(getInstancesPath(), instanceId, "minecraft");
  try {
    const files = await fs.readdir(minecraftPath);
    return files.length > 0;
  } catch {
    return false;
  }
}

export function registerInstanceHandlers(
  isInstanceBusy?: (instanceId: string) => boolean,
) {
  ipcMain.handle(
    "instances:create",
    async (_, payload: CreateInstancePayload) => {
      return await createInstance(payload);
    },
  );

  ipcMain.handle("instances:getAll", async () => {
    return await getInstances();
  });

  ipcMain.handle("instances:checkInstalled", async (_, instanceId: string) => {
    return await isInstanceInstalled(instanceId);
  });

  ipcMain.handle(
    "instances:rename",
    async (_, instanceId: string, newName: string) => {
      return await renameInstance(instanceId, newName);
    },
  );
  ipcMain.handle(
    "instances:updateSettings",
    async (_, instanceId: string, patch: UpdateInstanceSettingsPayload) => {
      return await updateInstanceSettings(instanceId, patch);
    },
  );

  ipcMain.handle(
    "instances:setLoaderVersion",
    async (_, instanceId: string, version: string) => {
      if (isInstanceBusy?.(instanceId)) {
        return { success: false, error: "Instance is currently running" };
      }
      return await setInstanceLoaderVersion(instanceId, version);
    },
  );

  ipcMain.handle("system:getTotalMemoryMb", () =>
    Math.floor(os.totalmem() / (1024 * 1024)),
  );

  ipcMain.handle("java:pickExecutable", async () => {
    const result = await dialog.showOpenDialog({
      properties: ["openFile"],
      filters:
        process.platform === "win32"
          ? [{ name: "Java", extensions: ["exe"] }]
          : undefined,
    });
    if (result.canceled || !result.filePaths[0]) return null;
    return result.filePaths[0];
  });
}
