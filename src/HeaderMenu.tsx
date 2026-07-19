import { X, Square, SquaresUnite, Minus } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import NimbusIcon from '../public/Logo.svg'

export default function HeaderMenu(){
    const [isMaximized, setIsMaximized] = useState(false)

    useEffect(() => {
    const handleWindowStatus = (_event: any, maximizedState: boolean) => {
      setIsMaximized(maximizedState)
    }
    window.ipcRenderer.on('window-is-maximized', handleWindowStatus)
    return () => {
      // window.ipcRenderer.removeAllListeners('window-is-maximized')
    }
  }, [])

    const handleMinimize = () => window.ipcRenderer.send('window-control', 'minimize')
    const handleMaximize = () => window.ipcRenderer.send('window-control', 'maximize')
    const handleClose = () => window.ipcRenderer.send('window-control', 'close')
    return (
        <header 
            style={{ WebkitAppRegion: 'drag' } as React.CSSProperties} 
            className="h-12 flex items-center justify-between bg-transparent border-b border-white/5 relative z-20"
        >
            <div className='flex ml-4 items-center gap-3'>
                <img src={NimbusIcon} alt="Icon" className='w-6 opacity-80'/>
                <div className="font-bold text-[11px] tracking-[0.2em] text-gray-400">
                    NIMBUS LAUNCHER
                </div>
            </div>

            <div 
                style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties} 
                className="flex items-center h-full mr-1"
            >
                <button 
                    onClick={handleMinimize}
                    className="h-9 w-11 flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white rounded-lg transition-all duration-200"
                >
                    <Minus size={16} />
                </button>

                <button 
                    onClick={handleMaximize}
                    className="h-9 w-11 flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white rounded-lg transition-all duration-200"
                >
                    {isMaximized ? <SquaresUnite size={14} /> : <Square size={14} />}
                </button>

                <button 
                    onClick={handleClose}
                    className="h-9 w-11 flex items-center justify-center text-gray-400 hover:bg-red-500/80 hover:text-white rounded-lg transition-all duration-200"
                >
                    <X size={16} />
                </button>
            </div>
        </header>
    )
}