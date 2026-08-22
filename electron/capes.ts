import { ipcMain } from 'electron'
import { getMinecraftAccessToken, getMinecraftProfileCapes } from './auth'

const CAPES_ACTIVE_ENDPOINT = 'https://api.minecraftservices.com/minecraft/profile/capes/active'

export function registerCapesHandlers(): void {
  // Список плащей, которыми владеет аккаунт. В отличие от скинов, плащи
  // не хранятся локально и не создаются пользователем — их выдаёт Mojang,
  // поэтому просто каждый раз запрашиваем актуальный список через профиль.
  ipcMain.handle('capes:get-all', async () => {
    return getMinecraftProfileCapes()
  })

  // capeId === null -> снять текущий плащ (DELETE)
  // capeId — конкретный id -> надеть выбранный плащ (PUT)
  ipcMain.handle('capes:apply', async (_, capeId: string | null) => {
    const token = await getMinecraftAccessToken()

    const res = capeId
      ? await fetch(CAPES_ACTIVE_ENDPOINT, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ capeId }),
        })
      : await fetch(CAPES_ACTIVE_ENDPOINT, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

    if (!res.ok) {
      const errorText = await res.text().catch(() => '')
      throw new Error(`Mojang API error ${res.status}: ${errorText}`)
    }

    return true
  })
}