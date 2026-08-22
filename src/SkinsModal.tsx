import { useEffect, useState, useRef, DragEvent, ChangeEvent } from 'react'
import { Plus } from 'lucide-react'
import CustomModal from './CustomModal'
import SkinLibraryTile from './SkinLibraryTile'
import { LibrarySkin } from './types'

type Props = {
  isOpen: boolean
  onClose: () => void
  uuid: string
  onSkinChanged: () => void
}

export default function SkinsModal({ isOpen, onClose, uuid, onSkinChanged }: Props) {
  const [skins, setSkins] = useState<LibrarySkin[]>([])
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadSkins = async () => {
    const data = await window.skins.getAll(uuid)
    setSkins(data)
  }

  useEffect(() => {
    if (isOpen) {
      loadSkins()
      setSelectedFile(null)
    }
  }, [isOpen])

  const processFilePath = async (filePath: string) => {
    await window.skins.add(filePath)
    loadSkins()
  }

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === 'image/png') {
      await processFilePath((file as any).path)
    }
    e.target.value = ''
  }

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file && file.type === 'image/png') {
      await processFilePath((file as any).path)
    }
  }

  const handleDelete = async (fileName: string) => {
    await window.skins.delete(fileName)
    if (selectedFile === fileName) setSelectedFile(null)
    loadSkins()
  }

  const handleApply = async () => {
    if (!selectedFile || isApplying) return
    setIsApplying(true)
    
    await window.skins.apply(uuid, selectedFile)
    await loadSkins()
    
    setIsApplying(false)
    setSelectedFile(null)
    onSkinChanged()
  }

  const hasChanges = selectedFile !== null && !skins.find(s => s.fileName === selectedFile)?.isActive

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} size="large" title="Skins Library">
      <p className="text-sm text-gray-400">Choose a ready-made skin or upload a new one.</p>

      <input 
        ref={fileInputRef}
        type="file" 
        accept="image/png" 
        className="hidden" 
        onChange={handleFileSelect} 
      />
      
      <div 
        className="grid grid-cols-4 gap-4 mt-4"
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <button 
          onClick={() => fileInputRef.current?.click()}
          className={`border-dashed border-2 flex flex-col items-center justify-center h-[180px] rounded-xl cursor-pointer transition-colors ${
            isDragging ? 'border-blue-500 bg-blue-500/20' : 'border-white/20 hover:bg-white/[0.05]'
          }`}
        >
          <Plus color="#fff" size={32} />
          <span className="text-xs text-gray-400"></span>
        </button>

        {skins.map(skin => (
          <SkinLibraryTile
            key={skin.fileName}
            skinUrl={skin.url}
            isActive={skin.isActive}
            isSelected={selectedFile === skin.fileName}
            onClick={() => setSelectedFile(skin.fileName)}
            onDelete={() => handleDelete(skin.fileName)}
          />
        ))}
      </div>

      <div className="mt-6 flex justify-end pt-4 border-t border-white/10">
        <button
          onClick={handleApply}
          disabled={!hasChanges || isApplying}
          className={`p-3 px-4 flex justify-center items-center rounded-lg font-medium transition-all ${
            hasChanges && !isApplying 
              ? 'bg-[#1c76fc] hover:bg-[#2b7fff] text-white cursor-pointer' 
              : 'bg-white/5 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isApplying ? 'Applying...' : 'Apply Changes'}
        </button>
      </div>
    </CustomModal>
  )
}