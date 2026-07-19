import { useEffect, useRef } from 'react'
import { SkinViewer, IdleAnimation } from 'skinview3d'
import { Box3, CanvasTexture, Mesh, MeshBasicMaterial, PlaneGeometry } from 'three'

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

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return

    const viewer = new SkinViewer({
      canvas: canvasRef.current,
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      pixelRatio: window.devicePixelRatio * 1.5,
    })

    viewer.fov = 60
    viewer.zoom = 0.5
    viewer.controls.enableZoom = false

    // Блокируем вертикальное перетаскивание (наклон камеры вверх/вниз),
    // оставляем только горизонтальное вращение вокруг персонажа.
    // Math.PI / 2 — это "экватор", камера всегда на уровне глаз модели.
    viewer.controls.minPolarAngle = Math.PI / 2
    viewer.controls.maxPolarAngle = Math.PI / 2

    // Изначальный разворот персонажа — playerWrapper не сбрасывается сменой анимации
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
    <div
      ref={containerRef}
      className='bg-[#1E2029] h-full w-[20%] rounded-xl border border-white/5 overflow-hidden'
    >
      <canvas ref={canvasRef} className='w-full h-full cursor-grab active:cursor-grabbing' />
    </div>
  )
}