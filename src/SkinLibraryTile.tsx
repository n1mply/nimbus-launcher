import { useEffect, useRef } from 'react'
import { SkinViewer, WalkingAnimation } from 'skinview3d'
import { Trash2 } from 'lucide-react'

type Props = {
  skinUrl: string
  isActive: boolean
  isSelected: boolean
  onClick: () => void
  onDelete: () => void
}

export default function SkinLibraryTile({ skinUrl, isActive, isSelected, onClick, onDelete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const viewerRef = useRef<SkinViewer | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const walkingAnimation = new WalkingAnimation()
    walkingAnimation.headBobbing = false

    const viewer = new SkinViewer({
      canvas: canvasRef.current,
      width: 120,
      height: 180,
      skin: skinUrl,
    })

    viewer.fov = 60
    viewer.zoom = 1.3
    viewer.controls.enableZoom = false
    viewer.controls.enableRotate = false

    // Камера немного справа/сбоку относительно персонажа, как на референсе.
    // Отрицательный X зеркально меняет сторону обзора относительно предыдущего варианта.
    // Чуть более высокий Y даёт лёгкий взгляд сверху.
    const cameraDistance = viewer.camera.position.length()
    viewer.camera.position.set(
      -cameraDistance * 0.28,
      cameraDistance * 0.20,
      cameraDistance * 1,
    )

    // Смотрим не в ноги, а примерно в центр корпуса. Это убирает ощущение
    // слишком сильного взгляда снизу и лучше соответствует референсу.
    viewer.controls.target.set(0, 5, 0)
    viewer.controls.update()

    // WalkingAnimation используется как источник нужной позы.
    // speed = 0 оставляет progress на месте, поэтому анимация фактически
    // становится одним зафиксированным кадром ходьбы.
    viewer.animation = walkingAnimation
    walkingAnimation.progress = 0.025
    walkingAnimation.speed = 0
    viewerRef.current = viewer

    return () => {
      viewer.dispose()
      viewerRef.current = null
    }
  }, [skinUrl])

  return (
    <div
      onClick={onClick}
      className={`relative rounded-xl border-2 flex flex-col items-center overflow-hidden cursor-pointer transition-all duration-300 ${
        isActive
          ? 'border-blue-500 bg-gradient-to-t from-blue-600/50 via-blue-600/10 to-transparent shadow-[0_4px_20px_rgba(59,130,246,0.15)]'
          : isSelected
          ? 'border-white/50 bg-white/[0.08]'
          : 'border-white/5 bg-white/[0.03] hover:bg-white/[0.08]'
      }`}
    >
      <canvas ref={canvasRef} className="w-full h-40 pointer-events-none" />

      {!isActive && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="absolute bottom-2 right-2 p-1.5 rounded-md transition-all duration-200 bg-gray/40 text-white hover:scale-[1.05] hover:bg-black/40 cursor-pointer"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  )
}