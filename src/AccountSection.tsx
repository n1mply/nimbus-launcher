import { useEffect, useRef, useState } from 'react'
import { SkinViewer } from 'skinview3d'
import { SkinViewBlockbench } from 'skinview3d-blockbench'
import { Box3, CanvasTexture, Mesh, MeshBasicMaterial, PlaneGeometry } from 'three'
import SidebarItem from './SidebarItem'
import AccountTile from './AccountTile'
import DeviceCodeModal from './DiviceCodeModal'
import CustomModal from './CustomModal'
import SkinsModal from './SkinsModal'
import CapesModal from './CapesModal'
import { Shirt, Scroll } from 'lucide-react'
import { Account } from './types'

import idleAnimation from './assets/animations/idle.animation.json'
import armLookOutAnimation from './assets/animations/armLookOut.animation.json'
import stretchAnimation from './assets/animations/stretch.animation.json'

const GUEST_SKIN = '/user_skin.png'

const EXTRA_ANIMATIONS = [
  { json: armLookOutAnimation, duration: 4000 },
  { json: stretchAnimation, duration: 4800 },
]

function createShadowTexture(): CanvasTexture {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!

  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  )

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
  const viewerRef = useRef<SkinViewer | null>(null)

  const [account, setAccount] = useState<Account | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isOpenSkins, setOpenSkins] = useState(false)
  const [isOpenCapes, setOpenCapes] = useState(false)

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return

    let actionTimeout: NodeJS.Timeout | null = null
    let resetTimeout: NodeJS.Timeout | null = null

    const viewer = new SkinViewer({
      canvas: canvasRef.current,
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      pixelRatio: window.devicePixelRatio * 1.5,
    })

    viewerRef.current = viewer

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

    const playIdle = () => {
      viewer.animation = new SkinViewBlockbench({
        animation: idleAnimation,
        forceLoop: true,
      })
    }

    const scheduleNextAction = () => {
      const randomDelay = Math.floor(Math.random() * 5000) + 8000

      actionTimeout = setTimeout(() => {
        const targetAction = EXTRA_ANIMATIONS[Math.floor(Math.random() * EXTRA_ANIMATIONS.length)]

        viewer.animation = new SkinViewBlockbench({
          animation: targetAction.json,
          forceLoop: false,
        })

        resetTimeout = setTimeout(() => {
          playIdle()
          scheduleNextAction()
        }, targetAction.duration)
      }, randomDelay)
    }

    viewer.loadSkin(GUEST_SKIN).then(() => {
      playIdle()
      scheduleNextAction()

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
      if (actionTimeout) clearTimeout(actionTimeout)
      if (resetTimeout) clearTimeout(resetTimeout)

      resizeObserver.disconnect()

      if (shadowMesh) {
        shadowMesh.geometry.dispose()
        ;(shadowMesh.material as MeshBasicMaterial).map?.dispose()
        ;(shadowMesh.material as MeshBasicMaterial).dispose()
      }

      viewer.dispose()
      viewerRef.current = null
    }
  }, [])


  // Восстановление сессии при старте лаунчера
  useEffect(() => {
    window.auth.restoreSession().then((result) => {
      if (result) {
        setAccount({
          uuid: result.profile.uuid,
          username: result.profile.username,
          skinUrl: result.localSkinPath ? `app-file://skins/${result.localSkinPath}` : GUEST_SKIN,
          capeUrl: result.activeCapeUrl,
        })
      }
      setIsLoading(false)
    })
  }, [])

  // Как только account меняется (логин/логаут/восстановление/смена скина) — обновляем 3D-модель
  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer) return
    viewer.loadSkin(account?.skinUrl ?? GUEST_SKIN)

    if (account?.capeUrl) {
      viewer.loadCape(account.capeUrl)
    } else {
      viewer.loadCape(null)
    }
  }, [account])

  const handleLogin = async () => {
    const result = await window.auth.login()
    if (result) {
      setAccount({
        uuid: result.profile.uuid,
        username: result.profile.username,
        skinUrl: result.localSkinPath ? `app-file://skins/${result.localSkinPath}` : GUEST_SKIN,
        capeUrl: result.activeCapeUrl,
      })
    }
  }

  const handleLogout = async () => {
    setAccount(null)
    
    if (window.auth.logout) {
      await window.auth.logout()
    }
  }

  const handleSkinChanged = () => {
    if (!account?.uuid) return
    // Принудительно сбрасываем кэш, добавляя параметр времени к URL.
    // Файл называется так же (uuid.png), но браузер скачает его заново.
    const updatedSkinUrl = `app-file://skins/${account.uuid}.png?t=${Date.now()}`
    setAccount({ ...account, skinUrl: updatedSkinUrl })
  }

  // Плащи раздаёт Mojang и хранит их у себя — URL плаща уникален для его
  // содержимого (в отличие от скинов), так что подмена кеша тут не нужна:
  // просто подставляем новый URL (или null, если плащ сняли).
  const handleCapeChanged = (newCapeUrl: string | null) => {
    setAccount((prev) => (prev ? { ...prev, capeUrl: newCapeUrl } : prev))
  }

  return (
    <div className="relative h-full w-[20%] rounded-xl overflow-hidden flex flex-col gap-5 ">
      <div className="flex flex-row justify-around w-full gap-2 shrink-0 relative z-20">
        <AccountTile
          username={isLoading ? 'Загрузка...' : account?.username ?? 'Sing in to your account'}
          isLoggedIn={!!account}
          skinUrl={account?.skinUrl ?? GUEST_SKIN}
          onClick={handleLogin}
          onLogout={handleLogout}
          isLoading={isLoading}
        />
      </div>

      <div ref={containerRef} className="relative flex-1 min-h-0 w-full">
        <div className="absolute top-1/2 left-1/2 bg-gradient-to-b from-[#1E2029] to-[#14151C] -translate-x-1/2 -translate-y-1/2 h-full w-full rounded-xl pointer-events-none border border-white/5" />
        <canvas 
          ref={canvasRef} 
          className={`relative z-10 w-full h-full cursor-grab active:cursor-grabbing block transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`} 
        />
      </div>

      <div className="flex flex-row justify-around gap-2 p-3 shrink-0 relative z-10 border border-white/5 bg-black/10 bg-gradient-to-b from-[#1E2029] to-[#14151C] rounded-xl">
        <SidebarItem icon={<Shirt size={24} />} isSelected={false} onClick={() => setOpenSkins(true)}/>
        <SidebarItem icon={<Scroll size={24} />} isSelected={false} onClick={() => setOpenCapes(true)} />
      </div>

      {/* Интеграция библиотеки скинов */}
      {account?.uuid ? (
        <SkinsModal 
          isOpen={isOpenSkins} 
          onClose={() => setOpenSkins(false)} 
          uuid={account.uuid}
          onSkinChanged={handleSkinChanged} 
        />
      ) : (
        <CustomModal isOpen={isOpenSkins} onClose={() => setOpenSkins(false)} size="small" title="Skins Library">
          <div className="flex items-center justify-center h-32">
            <p className="text-sm text-gray-400">Sing in to able to change skins</p>
          </div>
        </CustomModal>
      )}

      {account?.uuid ? (
        <CapesModal
          isOpen={isOpenCapes}
          onClose={() => setOpenCapes(false)}
          uuid={account.uuid}
          onCapeChanged={handleCapeChanged}
        />
      ) : (
        <CustomModal isOpen={isOpenCapes} onClose={() => setOpenCapes(false)} size="small" title="Your Capes">
          <div className="flex items-center justify-center h-32">
            <p className="text-sm text-gray-400">Sing in to able to change capes</p>
          </div>
        </CustomModal>
      )}

      <DeviceCodeModal />
    </div>
  )
}