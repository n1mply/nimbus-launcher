import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import CustomModal from './CustomModal'
import { MorphIcon } from 'morphicons/react' 
import { Clipboard, Check } from 'lucide'

export default function DeviceCodeModal() {
  const [deviceCode, setDeviceCode] = useState<{ code: string; url: string } | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [isCopied, setIsCopied] = useState(false)

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
      setIsCopied(false)
      return
    }

    const prefilledUrl = new URL(deviceCode.url)
    prefilledUrl.searchParams.set('otc', deviceCode.code)

    QRCode.toDataURL(prefilledUrl.toString(), { width: 160, margin: 1 }).then(setQrDataUrl)
  }, [deviceCode])

  const handleOpenLink = () => {
    if (!deviceCode) return
    window.ipcRenderer.invoke('shell:open-external', deviceCode.url)
  }

  const handleCopy = async () => {
    if (!deviceCode) return
    try {
      await navigator.clipboard.writeText(deviceCode.code)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2500)
    } catch (err) {
      console.error('Не удалось скопировать текст: ', err)
    }
  }

  return (
    <CustomModal isOpen={deviceCode !== null} onClose={() => setDeviceCode(null)} size="medium" title="Login to your account">
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="text-sm text-gray-400">
          Enter this code at the link below or scan the QR code.
        </p>

        {qrDataUrl && (
          <div className="bg-white p-3 rounded-lg">
            <img src={qrDataUrl} alt="QR-код для входа" width={160} height={160} />
          </div>
        )}

        <div className="flex items-center gap-2 mt-2">
          <div className="text-2xl font-bold tracking-widest text-white bg-white/5 px-4 py-2 rounded-lg">
            {deviceCode?.code}
          </div>
          
          <button
            onClick={handleCopy}
            className="flex items-center justify-center p-[14px] rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors h-full"
            title="Copy code"
            aria-label="Copy code"
          >
            <MorphIcon
              icon={isCopied ? Check : Clipboard}
              size={20}
              spring="snappy"
              strokeWidth={2.5}
            />
          </button>
        </div>

        <button
          onClick={handleOpenLink}
          className="text-sm text-blue-400 hover:text-blue-300 underline cursor-pointer mt-2"
        >
          {deviceCode?.url}
        </button>
      </div>
    </CustomModal>
  )
}