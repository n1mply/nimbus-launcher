import { ipcMain, app } from 'electron'
import path from 'node:path'
import { promises as fs } from 'node:fs'
import crypto from 'node:crypto'

function getSkinsDir(): string {
  return path.join(app.getPath('userData'), 'skins')
}

export function registerSkinsHandlers(): void {
  ipcMain.handle('skins:get-all', async (_, uuid: string) => {
    const skinsDir = getSkinsDir()
    await fs.mkdir(skinsDir, { recursive: true })
    const files = await fs.readdir(skinsDir)

    return files
      .filter(f => f.endsWith('.png'))
      .map(f => ({
        fileName: f,
        isActive: f === `${uuid}.png`,
        url: `app-file://skins/${f}`
      }))
      .sort((a, b) => (a.isActive ? -1 : 1)) 
  })


  ipcMain.handle('skins:add', async (_, sourcePath: string) => {
    const skinsDir = getSkinsDir()
    const uniqueName = `skin_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.png`
    const destPath = path.join(skinsDir, uniqueName)
    
    await fs.copyFile(sourcePath, destPath)
    return true
  })

 
  ipcMain.handle('skins:delete', async (_, fileName: string) => {
    const filePath = path.join(getSkinsDir(), fileName)
    await fs.unlink(filePath)
    return true
  })

  ipcMain.handle('skins:apply', async (_, uuid: string, newFileName: string) => {
    const skinsDir = getSkinsDir()
    const currentActivePath = path.join(skinsDir, `${uuid}.png`)
    const newActivePath = path.join(skinsDir, newFileName)

    try {
      await fs.access(currentActivePath)
      const backupName = `skin_backup_${Date.now()}.png`
      await fs.rename(currentActivePath, path.join(skinsDir, backupName))
    } catch { /* ... */ }

  
    await fs.rename(newActivePath, currentActivePath)

    // Create response with prismarine-auth to change users skin
    
    return true
  })
}