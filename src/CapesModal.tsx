import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import CustomModal from './CustomModal'
import CapeTile from './CapeTile'
import { Cape } from './types'

type Props = {
  isOpen: boolean
  onClose: () => void
  uuid: string
  onCapeChanged: (capeUrl: string | null) => void
}

function capesCacheKey(uuid: string): string {
  return `launcher:capesCache:${uuid}`
}

function Spinner({ size = 16 }: { size?: number }) {
  return (
    <span
      className="inline-block shrink-0 animate-spin rounded-full border-2 border-white/20 border-t-white"
      style={{ width: size, height: size }}
    />
  )
}

function loadCachedCapes(uuid: string): Cape[] {
  try {
    const raw = localStorage.getItem(capesCacheKey(uuid))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveCachedCapes(uuid: string, capes: Cape[]): void {
  try {
    localStorage.setItem(capesCacheKey(uuid), JSON.stringify(capes))
  } catch {

  }
}

export default function CapesModal({ isOpen, onClose, uuid, onCapeChanged }: Props) {
  const [capes, setCapes] = useState<Cape[]>([])
  const [selectedCapeId, setSelectedCapeId] = useState<string | null | undefined>(undefined)
  const [isApplying, setIsApplying] = useState(false)
  const [applyError, setApplyError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return

    setSelectedCapeId(undefined)
    setApplyError(null)
    setLoadError(null)

    const cached = loadCachedCapes(uuid)
    setCapes(cached)

    setIsRefreshing(true)
    window.capes
      .getAll()
      .then((fresh) => {
        setCapes((current) => {
          if (fresh.length < current.length) return current
          saveCachedCapes(uuid, fresh)
          return fresh
        })
      })
      .catch((err) => {
        if (cached.length === 0) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load capes')
        }
      })
      .finally(() => setIsRefreshing(false))
  }, [isOpen, uuid])

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

      const fresh = await window.capes.getAll(true)
      if (fresh.length >= capes.length) {
        setCapes(fresh)
        saveCachedCapes(uuid, fresh)
      }
      // если ответ короче текущего — оставляем как есть,
      // account.capeUrl в AccountSection уже обновлён через onCapeChanged ниже

      setSelectedCapeId(undefined)
      onCapeChanged(newCapeUrl)
    } catch (err) {
      setApplyError(err instanceof Error ? err.message : 'Failed to apply cape')
    } finally {
      setIsApplying(false)
    }
  }

  // Скелетон показываем только когда совсем нечего показать (нет кеша и
  // первый ответ ещё не пришёл) — иначе список уже на экране, и обновление
  // происходит бесшумно.
  const showSkeleton = isRefreshing && capes.length === 0 && !loadError

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} size="large" title="Your Capes">
      <div className="flex items-center gap-2">
        <p className="text-sm text-gray-400">Choose a cape to wear or remove the current one.</p>
        {isRefreshing && capes.length > 0 && <Spinner size={14} />}
      </div>

      {loadError && capes.length === 0 ? (
        <p className="text-sm text-red-400 mt-4">{loadError}</p>
      ) : (
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

          {showSkeleton ? (
            <div className="col-span-3 flex flex-col items-center justify-center gap-3 h-[180px] rounded-xl border-2 border-dashed border-white/10 text-gray-400">
              <Spinner size={28} />
              <span className="text-xs">Loading capes...</span>
            </div>
          ) : (
            capes.map((cape) => (
              <CapeTile
                key={cape.id}
                capeUrl={cape.url}
                name={cape.name}
                isActive={cape.isActive}
                isSelected={effectiveSelection === cape.id}
                onClick={() => setSelectedCapeId(cape.id)}
              />
            ))
          )}
        </div>
      )}

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