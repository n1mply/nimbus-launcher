import { app, ipcMain, shell } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';

export type DeleteMode = 'soft' | 'hard';

export function registerFolderHandlers() {
  // Открытие папки игры
  ipcMain.handle('folder:openInstanceFolder', async (_, folderName: string) => {
    try {
      const targetPath = path.join(
        app.getPath('userData'), 
        'instances',
        folderName,
        'minecraft'
      );

      if (!existsSync(targetPath)) {
        await fs.mkdir(targetPath, { recursive: true });
      }

      const errorMessage = await shell.openPath(targetPath);
      
      if (errorMessage) {
        console.error('Ошибка shell.openPath:', errorMessage);
        return { success: false, error: errorMessage };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Ошибка при работе с ФС:', error);
      return { success: false, error: error.message };
    }
  });

  // Удаление файлов сборки
  ipcMain.handle(
    'folder:deleteInstanceFolder',
    async (_, { folderName, mode }: { folderName: string; mode: DeleteMode }) => {
      try {
        const instancePath = path.join(app.getPath('userData'), 'instances', folderName);
        const minecraftPath = path.join(instancePath, 'minecraft');

        if (mode === 'soft') {
          // Удаляем только папку minecraft (файлы игры/моды/кэш загрузки)
          if (existsSync(minecraftPath)) {
            await fs.rm(minecraftPath, { recursive: true, force: true });
          }
        } else if (mode === 'hard') {
          // Полное удаление папки сборки вместе с instance.json
          if (existsSync(instancePath)) {
            await fs.rm(instancePath, { recursive: true, force: true });
          }
        }

        return { success: true };
      } catch (error: any) {
        console.error(`Ошибка при удалении (${mode}):`, error);
        return { success: false, error: error.message };
      }
    }
  );
}