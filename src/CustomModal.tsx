import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

type ModalSize = 'small' | 'medium'

type Props = {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  size?: ModalSize
  closeOnOutsideClick?: boolean
  closeOnEsc?: boolean
}

const sizeClasses: Record<ModalSize, string> = {
  small: 'w-[420px] max-h-[260px]',
  medium: 'w-[480px] max-h-[640px]',
}

const ANIMATION_DURATION = 200 // мс, совпадает с длительностью transition в классах ниже

function getOrCreatePortalRoot(): HTMLElement {
  const existing = document.getElementById('modal-root')
  if (existing) return existing

  const root = document.createElement('div')
  root.id = 'modal-root'
  document.body.appendChild(root)
  return root
}

export default function CustomModal({
  isOpen,
  onClose,
  children,
  title,
  size = 'small',
  closeOnOutsideClick = true,
  closeOnEsc = true,
}: Props) {
  const [portalRoot] = useState(getOrCreatePortalRoot)

  // shouldRender держит модалку в DOM чуть дольше, чем isOpen=false,
  // чтобы дать доиграть анимации закрытия
  const [shouldRender, setShouldRender] = useState(isOpen)
  // isAnimatingIn управляет самим классом transition (для открытия нужен один кадр задержки,
  // иначе браузер применит конечное состояние сразу, без перехода)
  const [isAnimatingIn, setIsAnimatingIn] = useState(false)

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>

    if (isOpen) {
      setShouldRender(true)
      // requestAnimationFrame даёт браузеру отрисовать начальное состояние (opacity-0, scale-95)
      // до того, как мы включим transition к конечному — иначе анимации не будет вообще
      requestAnimationFrame(() => setIsAnimatingIn(true))
    } else {
      setIsAnimatingIn(false)
      timeoutId = setTimeout(() => setShouldRender(false), ANIMATION_DURATION)
    }

    return () => clearTimeout(timeoutId)
  }, [isOpen])

  useEffect(() => {
    if (!shouldRender) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (closeOnEsc && e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [shouldRender, closeOnEsc, onClose])

  if (!shouldRender) return null

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${
        isAnimatingIn ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={closeOnOutsideClick ? onClose : undefined}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`flex flex-col bg-gradient-to-b from-[#1E2029] to-[#14151C] rounded-xl border border-white/5 shadow-2xl shadow-black/40 transition-all duration-200 ${sizeClasses[size]} ${
          isAnimatingIn ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        <div className="flex items-center justify-between shrink-0 px-5 py-4 border-b border-white/5">
          <h2 className="text-sm font-semibold text-white truncate">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-5">
          {children}
        </div>
      </div>
    </div>,
    portalRoot
  )
}