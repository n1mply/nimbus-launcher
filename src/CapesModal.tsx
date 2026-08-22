import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import CustomModal from './CustomModal'
import CapeTile from './CapeTile'
import { Cape } from './types'

type Props = {
  isOpen: boolean
  onClose: () => void
  onCapeChanged: (capeUrl: string | null) => void
}

export default function CapesModal({ isOpen, onClose, onCapeChanged }: Props) {
  const [capes, setCapes] = useState<Cape[]>([])
  // undefined — пользователь ещё ничего не выбирал в этом открытии модалки
  // (тогда сравниваем с реально активным плащом), null — явно выбрал "снять плащ"
  const [selectedCapeId, setSelectedCapeId] = useState<string | null | undefined>(undefined)
  const [isApplying, setIsApplying] = useState(false)
  const [applyError, setApplyError] = useState<string | null>(null)

  const loadCapes = async () => {
    const data = await window.capes.getAll()
    setCapes(data)
  }

  useEffect(() => {
    if (isOpen) {
      loadCapes()
      setSelectedCapeId(undefined)
      setApplyError(null)
    }
  }, [isOpen])

  const activeCapeId = capes.find((c) => c.isActive)?.id ?? null
  const effectiveSelection = selectedCapeId === undefined ? activeCapeId : selectedCapeId
  const hasChanges = effectiveSelection !== activeCapeId

  const handleApply = async () => {
    if (!hasChanges || isApplying) return
    setIsApplying(true)
    setApplyError(null)

    try {
      await window.capes.apply(effectiveSelection)
      const newCapeUrl = effectiveSelection
        ? capes.find((c) => c.id === effectiveSelection)?.url ?? null
        : null

      await loadCapes()
      setSelectedCapeId(undefined)
      onCapeChanged(newCapeUrl)
    } catch (err) {
      setApplyError(err instanceof Error ? err.message : 'Failed to apply cape')
    } finally {
      setIsApplying(false)
    }
  }

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} size="large" title="Your Capes">
      <p className="text-sm text-gray-400">Choose a cape to wear or remove the current one.</p>

      <div className="grid grid-cols-4 gap-4 mt-4">
        <button
          onClick={() => setSelectedCapeId(null)}
          className={`border-2 flex flex-col items-center justify-center h-[180px] rounded-xl cursor-pointer transition-colors ${
            effectiveSelection === null
              ? 'border-white/50 bg-white/[0.08]'
              : 'border-dashed border-white/20 hover:bg-white/[0.05]'
          }`}
        >
          <X color="#fff" size={32} />
          <span className="text-xs text-gray-400 mt-1">No cape</span>
        </button>

        {capes.map((cape) => (
          <CapeTile
            key={cape.id}
            capeUrl={cape.url}
            name={cape.name}
            isActive={cape.isActive}
            isSelected={effectiveSelection === cape.id}
            onClick={() => setSelectedCapeId(cape.id)}
          />
        ))}
      </div>

      <div className="mt-6 flex flex-col items-end gap-2 pt-4 border-t border-white/10">
        {applyError && <p className="text-xs text-red-400 text-right">{applyError}</p>}
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