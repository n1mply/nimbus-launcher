import { useState, useRef, useEffect, useMemo } from "react"
import { ChevronDown, Check, Eye, EyeOff } from "lucide-react"

export type CustomInputOption = {
    label: string
    value: string
    isStable?: boolean // используется только когда showStableToggle=true
}

type Props = {
    value: string
    onChange: (value: string) => void
    options: CustomInputOption[]
    placeholder?: string
    showStableToggle?: boolean // показывать переключатель "Show all versions" внизу списка
    isListGoingUp?: boolean // открывать выпадающий список вверх
}

export default function CustomInput({ value, onChange, options, placeholder, showStableToggle = false, isListGoingUp = false }: Props) {
    const [isOpen, setIsOpen] = useState(false)
    const [showAll, setShowAll] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const filteredOptions = useMemo(() => {
        const query = value.trim().toLowerCase()
        return options
            .filter((option) => (showStableToggle ? showAll || option.isStable !== false : true))
            .filter((option) => !query || option.label.toLowerCase().includes(query))
    }, [options, value, showAll, showStableToggle])

    const handleSelect = (option: CustomInputOption) => {
        onChange(option.value)
        setIsOpen(false)
    }

    return (
        <div ref={containerRef} className="relative">
            <div className="relative">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => {
                        onChange(e.target.value)
                        setIsOpen(true)
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder={placeholder}
                    className="w-full rounded-xl border border-white/5 bg-white/[0.03] py-2.5 pl-3 pr-9 text-[14px] text-white placeholder:text-gray-500 outline-none transition-colors focus:border-white/10 focus:bg-white/[0.05]"
                />
                <button
                    type="button"
                    onClick={() => setIsOpen((o) => !o)}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors cursor-pointer"
                >
                    <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                </button>
            </div>

            {isOpen && (
                <div
                    className={`absolute z-10 w-full overflow-hidden rounded-xl border border-white/5 bg-[#1A1B23] shadow-xl shadow-black/40 ${
                        isListGoingUp ? "bottom-full mb-1.5" : "top-full mt-1.5"
                    }`}
                >
                    <div className="max-h-52 overflow-y-auto custom-scrollbar">
                        {filteredOptions.length === 0 ? (
                            <p className="px-3 py-3 text-center text-[13px] text-gray-500">Nothing found</p>
                        ) : (
                            filteredOptions.map((option) => {
                                const isSelected = option.value === value
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => handleSelect(option)}
                                        className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-[13px] transition-colors cursor-pointer ${
                                            isSelected ? "bg-blue-500/10 text-blue-300" : "text-gray-300 hover:bg-white/[0.05]"
                                        }`}
                                    >
                                        {isSelected && <Check size={14} className="shrink-0" />}
                                        <span className="truncate">{option.label}</span>
                                    </button>
                                )
                            })
                        )}
                    </div>

                    {showStableToggle && (
                        <button
                            type="button"
                            onClick={() => setShowAll((prev) => !prev)}
                            className="flex w-full items-center justify-center gap-1.5 border-t border-white/5 py-2 text-[12px] text-gray-500 transition-colors hover:text-white cursor-pointer"
                        >
                            {showAll ? <EyeOff size={13} /> : <Eye size={13} />}
                            {showAll ? "Hide snapshots" : "Show all versions"}
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}