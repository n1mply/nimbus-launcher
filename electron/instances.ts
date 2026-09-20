import { app, ipcMain } from 'electron';
import fs from 'fs/promises';
import path from 'path';

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
}

const getMimeType = (fileName: string) => {
  const ext = path.extname(fileName).toLowerCase();
  switch (ext) {
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.webp': return 'image/webp';
    case '.svg': return 'image/svg+xml';
    default: return 'image/png';
  }
};

const getInstancesPath = () => path.join(app.getPath('userData'), 'instances');

// Очистка имени папки от запрещенных символов
const sanitizeFolderName = (name: string) => name.replace(/[<>:"/\\|?*\x00-\x1F]/g, '').trim();

export async function createInstance(payload: CreateInstancePayload) {
  const instancesDir = getInstancesPath();

  const rawName = payload.name || `${payload.modloader}-${payload.minecraftVersion}`;
  const folderName = sanitizeFolderName(rawName);
  
  if (!folderName) {
    throw new Error("Invalid instance name");
  }

  const instancePath = path.join(instancesDir, folderName);

  try {
    await fs.access(instancePath);
    return { success: false, error: 'Instance with this name already exists' };
  } catch {
    
  }

  try {
    await fs.mkdir(instancePath, { recursive: true });
    await fs.mkdir(path.join(instancePath, 'minecraft'), { recursive: true });

    let iconFileName = null;

    if (payload.instanceIconPath) {
      const ext = path.extname(payload.instanceIconPath) || '.png';
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
      path.join(instancePath, 'instance.json'),
      JSON.stringify(instanceData, null, 2),
      'utf-8'
    );

    return { success: true, data: instanceData };
  } catch (error) {
    console.error('Failed to create instance:', error);
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
      const dataPath = path.join(instanceFolderPath, 'instance.json');
      
      try {
        const fileContent = await fs.readFile(dataPath, 'utf-8');
        const instanceData = JSON.parse(fileContent);

        let instanceIconPath: string | null = null;

        if (instanceData.iconFileName) {
          const fullIconPath = path.join(instanceFolderPath, instanceData.iconFileName);
          try {
            const imageBuffer = await fs.readFile(fullIconPath);
            const mimeType = getMimeType(instanceData.iconFileName);
            instanceIconPath = `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
          } catch (e) {
            console.warn(`Could not load icon for ${dirent.name}:`, e);
          }
        }

        instances.push({
          ...instanceData,
          instanceIconPath,
        });
      } catch (e) {
        console.warn(`Skipped ${dirent.name}: instance.json is missing or invalid`);
      }
    }
  }

  return instances.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

export async function isInstanceInstalled(instanceId: string): Promise<boolean> {
  const minecraftPath = path.join(getInstancesPath(), instanceId, 'minecraft');
  try {
    const files = await fs.readdir(minecraftPath);
    return files.length > 0;
  } catch {
    return false;
  }
}

export function registerInstanceHandlers() {
  ipcMain.handle("instances:create", async (_, payload: CreateInstancePayload) => {
    return await createInstance(payload);
  });

  ipcMain.handle("instances:getAll", async () => {
    return await getInstances();
  });

  ipcMain.handle('instances:checkInstalled', async (_, instanceId: string) => {
    return await isInstanceInstalled(instanceId);
  });
}