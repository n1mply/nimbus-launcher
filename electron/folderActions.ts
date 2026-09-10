import { app, ipcMain, shell } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';

export function registerFolderHandlers() {
  ipcMain.handle('folder:openInstanceFolder', async (_, folderName: string) => {
    try {
      const targetPath = path.join(
        app.getPath('userData'), 
        'instances',
        folderName,
        'minecraft'
      );

      // Асинхронно создаем папку, если её нет
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
  // TODO: Сделать CRUD для управления файлами сборки 
}