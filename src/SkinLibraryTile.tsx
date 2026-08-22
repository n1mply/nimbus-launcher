import { useEffect, useRef } from 'react'
import { SkinViewer, WalkingAnimation, IdleAnimation } from 'skinview3d'
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
    const viewer = new SkinViewer({
      canvas: canvasRef.current,
      width: 120,
      height: 180,
      skin: skinUrl,
    })
    
    viewer.fov = 70
    viewer.zoom = 0.8
    viewer.controls.enableZoom = false
    viewer.animation = new WalkingAnimation()
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
          ? 'border-blue-500 bg-gradient-to-t from-blue-600/50 via-blue-600/10 to-transparent shadow-[0_4px_20px_rgba(59,130,246,0.15)]' // Тот самый эффект с картинки
          : isSelected 
          ? 'border-white/50 bg-white/[0.08]'
          : 'border-white/5 bg-white/[0.03] hover:bg-white/[0.08]'
      }`}
    >
      <canvas ref={canvasRef} className="w-full h-40 pointer-events-none" />

      {!isActive && (
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className={`absolute bottom-2 right-2 p-1.5 rounded-md transition-all duration-200 bg-gray/40 text-white hover:scale-[1.05] hover:bg-black/40 cursor-pointer`}
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  )
}