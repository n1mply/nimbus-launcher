import { Authflow, Titles } from 'prismarine-auth'
import { BrowserWindow, ipcMain, app, shell, protocol } from 'electron'
import path from 'node:path'
import { promises as fs } from 'node:fs'
import { Cape } from './types'

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

// Единая точка создания Authflow — используется и для полноценного логина,
// и там, где нужен просто актуальный токен (например, при аплоаде скина).
// Параметры (username + cacheDir) те же самые, поэтому prismarine-auth
// подхватывает уже существующую сессию с диска и тихо обновляет токен,
// не требуя повторного входа, пока жив refresh-токен.
function createAuthflow(onDeviceCode?: (deviceCode: { user_code: string; verification_uri: string }) => void): Authflow {
  return new Authflow(
    'nimbus-launcher-user',
    getAuthCacheDir(),
    {
      flow: 'live',
      authTitle: Titles.MinecraftNintendoSwitch,
      deviceType: 'Nintendo',
    },
    onDeviceCode
  )
}

// Коллбэк, который показывает модалку с device-code — переиспользуется
// везде, где может понадобиться тихая переавторизация без полноценного логина.
function notifyDeviceCode(deviceCode: { user_code: string; verification_uri: string }): void {
  mainWindowRef?.webContents.send('auth:device-code', {
    code: deviceCode.user_code,
    url: deviceCode.verification_uri,
  })
}

// Возвращает актуальный Minecraft access-токен для похода в minecraftservices.com API
// (например, для загрузки скина). Если сессия по какой-то причине требует
// повторной авторизации, показываем ту же device-code модалку, что и при логине.
export async function getMinecraftAccessToken(): Promise<string> {
  const flow = createAuthflow(notifyDeviceCode)
  const result = await flow.getMinecraftJavaToken({ fetchProfile: false })
  return result.token
}

// Список плащей, которыми владеет аккаунт (выдаются Mojang за ачивменты/события,
// пользователь не может их создавать сам — только выбирать из уже имеющихся
// или снимать текущий). fetchProfile: true подтягивает полный профиль,
// включая массив capes с состоянием ACTIVE/INACTIVE у каждого.
export async function getMinecraftProfileCapes(): Promise<Cape[]> {
  const flow = createAuthflow(notifyDeviceCode)
  const result = await flow.getMinecraftJavaToken({ fetchProfile: true })
  const capes = result.profile?.capes ?? []

  return capes.map((c: any) => ({
    id: c.id,
    name: c.alias ?? c.id,
    url: c.url,
    isActive: c.state === 'ACTIVE',
  }))
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

    const flow = createAuthflow((deviceCode) => {
      codeWasShown = true
      if (!showDeviceCodeUI) {
        reject(new Error('AUTH_REQUIRED'))
        return
      }
      notifyDeviceCode(deviceCode)
    })

    flow
      .getMinecraftJavaToken({ fetchProfile: true })
      .then(resolve)
      .catch((err) => {
        if (!codeWasShown) reject(err)
        
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

  const activeCape = profile.capes?.find((c: any) => c.state === 'ACTIVE')
  
  const activeCapeUrl: string | null = activeCape?.url ?? null

  return {
    profile: { uuid: profile.id, username: profile.name },
    localSkinPath,
    activeCapeUrl,
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