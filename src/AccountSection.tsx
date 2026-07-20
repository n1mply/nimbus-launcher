import { useEffect, useRef, useState } from 'react'
import { SkinViewer, IdleAnimation } from 'skinview3d'
import { Box3, CanvasTexture, Mesh, MeshBasicMaterial, PlaneGeometry } from 'three'
import SidebarItem from './SidebarItem'
import AccountTile from './AccountTile'
import { Shirt, Scroll } from 'lucide-react'
import CustomModal from './CustomModal'

function createShadowTexture(): CanvasTexture {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!

  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, 'rgba(0,0,0,0.7)')
  gradient.addColorStop(0.6, 'rgba(0,0,0,0.35)')
  gradient.addColorStop(1, 'rgba(0,0,0,0)')

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  return new CanvasTexture(canvas)
}

export default function AccountSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isOpenSkins, setOpenSkins] = useState(false)
  const [isOpenCapes, setOpenCapes] = useState(false)
  const [isOpenAccount, setOpenAccount] = useState(false)

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return

    const viewer = new SkinViewer({
      canvas: canvasRef.current,
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      pixelRatio: window.devicePixelRatio * 1.5,
    })

    viewer.fov = 60
    viewer.zoom = 0.6
    viewer.controls.enableZoom = false

    viewer.controls.minPolarAngle = Math.PI / 2
    viewer.controls.maxPolarAngle = Math.PI / 2

    viewer.playerWrapper.rotation.y = -Math.PI / 7

    const resizeObserver = new ResizeObserver(([entry]) => {
      if (!entry) return
      const { width, height } = entry.contentRect
      viewer.width = width
      viewer.height = height
    })
    resizeObserver.observe(containerRef.current)

    let shadowMesh: Mesh | null = null

    viewer.loadSkin('/user_skin.png').then(() => {
      viewer.animation = new IdleAnimation()

      const box = new Box3().setFromObject(viewer.playerObject)

      shadowMesh = new Mesh(
        new PlaneGeometry(22, 22),
        new MeshBasicMaterial({
          map: createShadowTexture(),
          transparent: true,
          depthWrite: false,
        })
      )
      shadowMesh.rotation.x = -Math.PI / 2
      shadowMesh.position.y = box.min.y + 0.05

      viewer.scene.add(shadowMesh)
    })

    return () => {
      resizeObserver.disconnect()
      if (shadowMesh) {
        shadowMesh.geometry.dispose()
        ;(shadowMesh.material as MeshBasicMaterial).map?.dispose()
        ;(shadowMesh.material as MeshBasicMaterial).dispose()
      }
      viewer.dispose()
    }
  }, [])

  return (
    <>
    <div
      className='relative h-full w-[20%] rounded-xl overflow-hidden shadow-2xl shadow-black/40 flex flex-col gap-5'
    >
        <div className="flex flex-row justify-around w-full shrink-0 relative z-10">
          <AccountTile />
        </div>
      {/* Обертка для канваса. flex-1 заставляет её занять всё оставшееся место.
          Сюда перенесён containerRef для правильного расчета размеров 3D-сцены */}
      <div ref={containerRef} className="relative flex-1 min-h-0 w-full">

        <div className="absolute top-1/2 left-1/2 bg-gradient-to-b from-[#1E2029] to-[#14151C]  -translate-x-1/2 -translate-y-1/2 h-full w-full rounded-xl pointer-events-none border border-white/5" />
        <canvas 
          ref={canvasRef} 
          className='relative z-10 w-full h-full cursor-grab active:cursor-grabbing block' 
        />
      </div>

      <div className="flex flex-row justify-around gap-2 shrink-0 relative z-10 border border-white/5 bg-black/10 bg-gradient-to-b from-[#1E2029] to-[#14151C] rounded-xl">
        <SidebarItem icon={<Shirt size={24} />} isSelected={false} onClick={() => setOpenSkins(true)}/>
        <SidebarItem icon={<Scroll size={24} />} isSelected={false} onClick={() => setOpenCapes(true)}/>
      </div>
    </div>
      <CustomModal isOpen={isOpenCapes} onClose={() => setOpenCapes(false)} size="medium" title="Your Capes">
        <p className="text-sm text-gray-400">So many Capes!!!</p>
      </CustomModal>
      <CustomModal isOpen={isOpenSkins} onClose={() => setOpenSkins(false)} size="medium" title="Your Skins">
        <p className="text-sm text-gray-400">So many skins!!!</p>
      </CustomModal>
    </>
  )
}