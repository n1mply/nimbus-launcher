import { ipcMain, app } from 'electron'
import path from 'node:path'
import { promises as fs } from 'node:fs'
import crypto from 'node:crypto'
import { getMinecraftAccessToken } from './auth'

function getSkinsDir(): string {
  return path.join(app.getPath('userData'), 'skins')
}

async function uploadSkinToMojang(
  token: string,
  filePath: string,
  variant: 'classic' | 'slim' = 'classic'
): Promise<void> {
  const fileBuffer = await fs.readFile(filePath)

  const formData = new FormData()
  formData.append('variant', variant)
  formData.append('file', new Blob([fileBuffer], { type: 'image/png' }), 'skin.png')

  const res = await fetch('https://api.minecraftservices.com/minecraft/profile/skins', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })

  if (!res.ok) {
    const errorText = await res.text().catch(() => '')
    throw new Error(`Mojang API error ${res.status}: ${errorText}`)
  }
}

export function registerSkinsHandlers(): void {
  ipcMain.handle('skins:get-all', async (_, uuid: string) => {
    const skinsDir = getSkinsDir()
    await fs.mkdir(skinsDir, { recursive: true })
    const files = await fs.readdir(skinsDir)
    const pngFiles = files.filter(f => f.endsWith('.png'))

    const entries = await Promise.all(
      pngFiles.map(async (f) => {
        const stats = await fs.stat(path.join(skinsDir, f))
        return {
          fileName: f,
          isActive: f === `${uuid}.png`,
          // Версия по mtime в query-параметре: URL активного скина всегда
          // один и тот же (`{uuid}.png`), но его содержимое подменяется при
          // apply — без этого three.js/Chromium показывают закешированную
          // по старому URL текстуру вместо реально актуального файла.
          url: `app-file://skins/${f}?v=${stats.mtimeMs}`,
        }
      })
    )

    return entries.sort((a, b) => (a.isActive ? -1 : 1)) // Активный всегда первый
  })

  // Добавление скина
  ipcMain.handle('skins:add', async (_, sourcePath: string) => {
    const skinsDir = getSkinsDir()
    const uniqueName = `skin_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.png`
    const destPath = path.join(skinsDir, uniqueName)
    
    await fs.copyFile(sourcePath, destPath)
    return true
  })

  // Удаление скина
  ipcMain.handle('skins:delete', async (_, fileName: string) => {
    const filePath = path.join(getSkinsDir(), fileName)
    await fs.unlink(filePath)
    return true
  })

  // Применение скина
  ipcMain.handle('skins:apply', async (_, uuid: string, newFileName: string) => {
    const skinsDir = getSkinsDir()
    const currentActivePath = path.join(skinsDir, `${uuid}.png`)
    const newActivePath = path.join(skinsDir, newFileName)

    let backupPath: string | null = null

    // 1. Бэкапим текущий активный скин
    try {
      await fs.access(currentActivePath)
      const backupName = `skin_backup_${Date.now()}.png`
      backupPath = path.join(skinsDir, backupName)
      await fs.rename(currentActivePath, backupPath)
    } catch { /* Активного скина нет */ }

    // 2. Делаем выбранный скин активным
    await fs.rename(newActivePath, currentActivePath)
    // Явно обновляем mtime: на некоторых ФС rename не меняет время
    // модификации файла, а именно на него завязан cache-busting в get-all
    const now = new Date()
    await fs.utimes(currentActivePath, now, now)

    // 3. Отправка на Mojang API
    try {
      const token = await getMinecraftAccessToken()
      await uploadSkinToMojang(token, currentActivePath)
    } catch (err) {
      // Не удалось применить скин на серверах Mojang — откатываем локальные
      // переименования, чтобы файлы на диске не разъезжались с тем, что
      // реально активно на аккаунте.
      await fs.rename(currentActivePath, newActivePath)
      if (backupPath) {
        await fs.rename(backupPath, currentActivePath)
      }
      throw err
    }

    return true
  })
}