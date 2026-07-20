import { useEffect, useRef } from 'react'
import { ChevronDown } from 'lucide-react'

type Props = {
  username?: string
  accountType?: string
  skinUrl?: string
  onClick?: () => void
}

export default function AccountTile({
  username = 'n1mply',
  accountType = 'Microsoft аккаунт',
  skinUrl = '/user_skin.png',
  onClick,
}: Props) {
  const avatarCanvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = avatarCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const image = new Image()
    image.src = skinUrl
    image.onload = () => {
      ctx.imageSmoothingEnabled = false
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      ctx.drawImage(image, 8, 8, 8, 8, 0, 0, canvas.width, canvas.height)


      ctx.drawImage(image, 40, 8, 8, 8, 0, 0, canvas.width, canvas.height)
    }
  }, [skinUrl])

  return (
    <button
      onClick={onClick}
      className="flex bg-gradient-to-b from-[#1E2029] to-[#14151C] items-center gap-3 w-full rounded-xl border border-white/5 transition-colors px-3 py-2.5 text-left"
    >
      <canvas
        ref={avatarCanvasRef}
        width={40}
        height={40}
        className="rounded-md shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-white truncate">{username}</div>
        <div className="text-xs text-gray-500 truncate">{accountType}</div>
      </div>
      <ChevronDown size={18} className="text-gray-500 shrink-0" />
    </button>
  )
}