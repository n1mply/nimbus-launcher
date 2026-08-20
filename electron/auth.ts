import { Authflow, Titles } from 'prismarine-auth'
import { BrowserWindow, ipcMain, app, shell, protocol } from 'electron'
import path from 'node:path'
import { promises as fs } from 'node:fs'

declare module 'prismarine-auth' {
  interface MicrosoftAuthFlowOptions {
    doSisuAuth?: boolean
  }
}

let mainWindowRef: BrowserWindow | null = null

export function setAuthMainWindow(win: BrowserWindow): void {
  mainWindowRef = win
}

function getSkinsDir(): string {
  return path.join(app.getPath('userData'), 'skins')
}

function getAuthCacheDir(): string {
  return path.join(app.getPath('userData'), 'auth-cache')
}

async function downloadAndSaveSkin(uuid: string, skinUrl: string): Promise<string> {
  await fs.mkdir(getSkinsDir(), { recursive: true })
  const res = await fetch(skinUrl)
  const buffer = Buffer.from(await res.arrayBuffer())
  const filePath = path.join(getSkinsDir(), `${uuid}.png`)
  await fs.writeFile(filePath, buffer)
  return `${uuid}.png`  
}


// showDeviceCodeUI=false используется при тихом восстановлении сессии при старте
// приложения — если токен протух и нужен новый вход, мы не показываем модалку
// сами по себе, а просто сообщаем "нужен логин" и даём пользователю нажать кнопку сам.
function loginWithPrismarine(showDeviceCodeUI: boolean) {
  return new Promise<any>((resolve, reject) => {
    let codeWasShown = false

    const flow = new Authflow(
      'nimbus-launcher-user',
      getAuthCacheDir(),
      {
        flow: 'live',
        authTitle: Titles.MinecraftNintendoSwitch,
        deviceType: 'Nintendo',
      },
      (deviceCode) => {
        codeWasShown = true
        if (!showDeviceCodeUI) {
          reject(new Error('AUTH_REQUIRED'))
          return
        }
        mainWindowRef?.webContents.send('auth:device-code', {
          code: deviceCode.user_code,
          url: deviceCode.verification_uri,
        })
      }
    )

    flow
      .getMinecraftJavaToken({ fetchProfile: true })
      .then(resolve)
      .catch((err) => {
        if (!codeWasShown) reject(err)
        // если codeWasShown уже true и showDeviceCodeUI=false — промис уже reject-нут выше
      })
  })
}

async function processLoginResult(result: any) {
  const profile = result.profile
  const activeSkin = profile.skins?.find((s: any) => s.state === 'ACTIVE') ?? profile.skins?.[0]

  let localSkinPath: string | null = null
  if (activeSkin?.url) {
    localSkinPath = await downloadAndSaveSkin(profile.id, activeSkin.url)
  }

  return {
    profile: { uuid: profile.id, username: profile.name },
    localSkinPath,
  }
}

export function registerAuthHandlers(): void {
  ipcMain.handle('auth:login', async () => {
    const result = await loginWithPrismarine(true)
    return processLoginResult(result)
  })

  ipcMain.handle('auth:restore-session', async () => {
    try {
      const result = await loginWithPrismarine(false)
      return processLoginResult(result)
    } catch {
      return null // токена нет/протух — пусть пользователь войдёт вручную
    }
  })

  ipcMain.handle('auth:logout', async () => {
    await fs.rm(getAuthCacheDir(), { recursive: true, force: true })
  })

  ipcMain.handle('shell:open-external', (_event, url: string) => {
    shell.openExternal(url)
  })
}

export function registerAppFileProtocol(): void {
protocol.handle('app-file', async (request) => {
  const url = new URL(request.url)
  const fileName = decodeURIComponent(url.pathname).replace(/^\//, '')
  const filePath = path.join(getSkinsDir(), fileName)

  try {
    const data = await fs.readFile(filePath)
    return new Response(data, {
      headers: {
        'Cache-Control': 'no-store',
      },
    })
  } catch {
    return new Response(null, { status: 404 })
  }
})
}