import { useEffect, useRef, useState } from 'react'
import { ChevronDown, LogOut } from 'lucide-react'

type Props = {
  username: string
  isLoggedIn: boolean
  skinUrl: string
  onClick: () => void
  onLogout: () => void
  isLoading?: boolean
}

export default function AccountTile({ username, isLoggedIn, skinUrl, onClick, onLogout, isLoading = false }: Props) {
  const avatarCanvasRef = useRef<HTMLCanvasElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

  const handleTileClick = () => {
    if (isLoading) return
    if (isLoggedIn) {
      setIsOpen(!isOpen)
    } else {
      onClick()
    }
  }

  const handleLogoutClick = () => {
    setIsOpen(false)
    onLogout()
  }

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        onClick={handleTileClick}
        disabled={isLoading}
        className={`flex items-center gap-3 w-full rounded-xl border border-white/5 bg-white/[0.03] px-3 py-3 text-left transition-colors ${
          isLoading ? 'cursor-default' : 'hover:bg-white/[0.06] cursor-pointer'
        }`}
      >
        <div className="relative w-10 h-10 shrink-0 rounded-md bg-black/20 overflow-hidden">
          <canvas 
            ref={avatarCanvasRef} 
            width={40} 
            height={40} 
            className={`absolute inset-0 transition-opacity duration-300 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`} 
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-white truncate">{username}</div>
          <div className="text-xs text-gray-500 truncate">
            {isLoading ? 'Finding session...' : isLoggedIn ? 'Minecraft account' : 'Click to sign in'}
          </div>
        </div>
        
        {isLoggedIn && !isLoading && (
          <ChevronDown 
            size={18} 
            className={`text-gray-500 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
          />
        )}
      </button>

      <div 
        className={`absolute left-0 top-full mt-2 w-full rounded-xl border border-white/5 bg-[#161821] p-1.5 shadow-2xl transition-all duration-300 z-50 ${
          isOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-2 invisible'
        }`}
      >
        <button
          onClick={handleLogoutClick}
          className="flex w-full text-center justify-center items-center gap-2 rounded-lg px-2 py-2 text-sm text-red-400 transition-colors hover:bg-white/5 hover:text-red-300"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}