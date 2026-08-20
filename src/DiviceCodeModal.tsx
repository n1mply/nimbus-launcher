import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import CustomModal from './CustomModal'

export default function DeviceCodeModal() {
  const [deviceCode, setDeviceCode] = useState<{ code: string; url: string } | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

  useEffect(() => {
    const handler = (_event: unknown, data: { code: string; url: string }) => {
      setDeviceCode(data)
    }
    window.ipcRenderer.on('auth:device-code', handler)
    return () => window.ipcRenderer.off('auth:device-code', handler)
  }, [])

  useEffect(() => {
    if (!deviceCode) {
      setQrDataUrl(null)
      return
    }

    // Прошиваем в QR не голую ссылку, а ссылку с уже подставленным кодом.
    // Параметр otc ("one-time code") — Microsoft сам подхватывает его на странице
    // microsoft.com/link и вводит код автоматически, без ручного набора.
    const prefilledUrl = new URL(deviceCode.url)
    prefilledUrl.searchParams.set('otc', deviceCode.code)

    QRCode.toDataURL(prefilledUrl.toString(), { width: 160, margin: 1 }).then(setQrDataUrl)
  }, [deviceCode])

  const handleOpenLink = () => {
    if (!deviceCode) return
    // invoke, а не send — на стороне main зарегистрирован именно ipcMain.handle
    window.ipcRenderer.invoke('shell:open-external', deviceCode.url)
  }

  return (
    <CustomModal isOpen={deviceCode !== null} onClose={() => setDeviceCode(null)} size="medium" title="Вход в аккаунт">
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="text-sm text-gray-400">
          Введите этот код по ссылке ниже или отсканируйте QR-код
        </p>

        {qrDataUrl && (
          <div className="bg-white p-3 rounded-lg">
            <img src={qrDataUrl} alt="QR-код для входа" width={160} height={160} />
          </div>
        )}

        <div className="text-2xl font-bold tracking-widest text-white bg-white/5 px-4 py-2 rounded-lg">
          {deviceCode?.code}
        </div>

        <button
          onClick={handleOpenLink}
          className="text-sm text-blue-400 hover:text-blue-300 underline cursor-pointer"
        >
          {deviceCode?.url}
        </button>
      </div>
    </CustomModal>
  )
}