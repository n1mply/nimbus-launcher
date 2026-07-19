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
    <>
        <header 
            style={{ WebkitAppRegion: 'drag' } as React.CSSProperties} 
            className="h-12 flex items-center justify-between bg-[#1E2029] border-b border-white/5">
            <div className='flex ml-3 items-center gap-2'>
                <img src={NimbusIcon} alt="Icon" className='flex w-8'/>
                <div className="font-bold text-xs tracking-widest text-gray-400">NIMBUS LAUNCHER</div>
            </div>

                <div 
                    style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties} 
                    className="flex items-center h-full"
                >
                    <button 
                        onClick={handleMinimize}
                        className="h-12 w-12 flex items-center justify-center text-gray-400 hover:bg-white/5 hover:text-white rounded-xl transition-colors"
                    >
                        <Minus size={16} />
                    </button>

                    <button 
                        onClick={handleMaximize}
                        className="h-12 w-12 flex items-center justify-center text-gray-400 hover:bg-white/5 hover:text-white rounded-xl transition-colors"
                    >
                        {isMaximized ? <SquaresUnite size={14} /> : <Square size={14} />}
                    </button>

                    <button 
                            onClick={handleClose}
                            className="h-12 w-12 flex items-center justify-center text-gray-400 hover:bg-red-500 hover:text-white rounded-xl transition-colors"
                        >
                        <X size={16} />
                    </button>
                </div>
        </header>
    </>
    )
}