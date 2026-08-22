import { useEffect, useRef } from 'react'

type Props = {
  capeUrl: string
  name: string
  isActive: boolean
  isSelected: boolean
  onClick: () => void
}

// Текстура плаща — это развёртка 3D-бокса 64x32 (верх/низ/перед/бок/зад),
// как и у скина. Для превью берём грань "Front" — x=1, y=1, размер 10x16.
const CAPE_FRONT_REGION = { x: 1, y: 1, width: 10, height: 16 }

export default function CapeTile({ capeUrl, name, isActive, isSelected, onClick }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const image = new Image()
    image.src = capeUrl
    image.onload = () => {
      ctx.imageSmoothingEnabled = false
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(
        image,
        CAPE_FRONT_REGION.x,
        CAPE_FRONT_REGION.y,
        CAPE_FRONT_REGION.width,
        CAPE_FRONT_REGION.height,
        0,
        0,
        canvas.width,
        canvas.height
      )
    }
  }, [capeUrl])

  return (
    <div
      onClick={onClick}
      className={`relative rounded-xl border-2 flex flex-col items-center justify-center gap-2 p-3 h-[180px] overflow-hidden cursor-pointer transition-all duration-300 ${
        isActive
          ? 'border-blue-500 bg-gradient-to-t from-blue-600/50 via-blue-600/10 to-transparent shadow-[0_4px_20px_rgba(59,130,246,0.15)]'
          : isSelected
          ? 'border-white/50 bg-white/[0.08]'
          : 'border-white/5 bg-white/[0.03] hover:bg-white/[0.08]'
      }`}
    >
      <canvas
        ref={canvasRef}
        width={60}
        height={96}
        className="rounded-[6px] pointer-events-none [image-rendering:pixelated]"
        style={{ width: '60px', height: '96px' }}
      />
      <span className="text-xs text-gray-300 truncate w-full text-center">{name}</span>
    </div>
  )
}