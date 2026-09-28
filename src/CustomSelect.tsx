import { useEffect, useRef, useState } from "react"
import { ChevronDown, Check } from "lucide-react"
import type { CustomInputOption } from "./CustomInput"

type Props = {
    value: string
    onChange: (value: string) => void
    options: CustomInputOption[]
    isListGoingUp?: boolean
}

export default function CustomSelect({ value, onChange, options, isListGoingUp = false }: Props) {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const selected = options.find((o) => o.value === value)

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleSelect = (option: CustomInputOption) => {
        onChange(option.value)
        setIsOpen(false)
    }

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                onClick={() => setIsOpen((o) => !o)}
                className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/[0.03] h-[42.6px] px-3 py-2 text-[13px] text-blue-300 transition-colors hover:bg-white/[0.05] cursor-pointer"
            >
                <span className="whitespace-nowrap font-medium">{selected?.label ?? "—"}</span>
                <ChevronDown
                    size={13}
                    className={`text-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                />
            </button>

            {isOpen && (
                <div
                    className={`absolute z-50 min-w-[9rem] overflow-hidden rounded-xl border border-white/5 bg-[#1A1B23] shadow-xl shadow-black/40 ${
                        isListGoingUp ? "bottom-full mb-1.5" : "top-full mt-1.5"
                    }`}
                >
                    <div className="max-h-52 overflow-y-auto custom-scrollbar">
                        {options.map((option) => {
                            const isSelected = option.value === value
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => handleSelect(option)}
                                    className={`flex w-full items-center gap-2 whitespace-nowrap px-3 py-2.5 text-left text-[13px] transition-colors cursor-pointer ${
                                        isSelected ? "bg-blue-500/10 text-blue-300" : "text-gray-300 hover:bg-white/[0.05]"
                                    }`}
                                >
                                    {isSelected && <Check size={14} className="shrink-0" />}
                                    <span className="truncate">{option.label}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}