import { Box } from "lucide-react"
import { Instance } from "./types"

type InstanceTileProps = Instance & { variant?: "grid" | "list" }

export default function InstanceTile({ name, modloader, minecraftVersion, instanceIconPath, variant = "grid" }: InstanceTileProps) {
    const modloaderLabel = modloader.charAt(0).toUpperCase() + modloader.slice(1)
    const subtitle = `${modloaderLabel} ${minecraftVersion}`

    if (variant === "list") {
        return (
            <button className="group flex w-full min-w-0 items-center gap-4 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 text-left transition-all duration-200 hover:bg-white/[0.06] hover:border-white/10 cursor-pointer">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/5 transition-colors group-hover:bg-white/[0.08]">
                    {instanceIconPath ? (
                        <img src={instanceIconPath} alt={name} className="h-full w-full object-contain rounded" />
                    ) : (
                        <Box size={20} strokeWidth={1.5} className="text-gray-400" />
                    )}
                </div>
                <div className="flex min-w-0 flex-1 items-baseline justify-between gap-3">
                    <p title={name} className="text-[14px] font-medium text-white truncate">{name}</p>
                    <p title={subtitle} className="text-[12px] text-gray-500 truncate shrink-0">{subtitle}</p>
                </div>
            </button>
        )
    }

    return (
        <button className="group flex w-full min-w-0 flex-col items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-5 text-center transition-all duration-200 hover:bg-white/[0.06] hover:border-white/10 hover:-translate-y-0.5 cursor-pointer">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-white/5 transition-colors group-hover:bg-white/[0.08]">
                {instanceIconPath ? (
                    <img src={instanceIconPath} alt={name} className="h-full w-full object-contain rounded-md" />
                ) : (
                    <Box size={32} strokeWidth={1.5} className="text-gray-400" />
                )}
            </div>
            <div className="flex flex-col gap-0.5 min-w-0 w-full">
                <p title={name} className="text-[14px] font-medium text-white truncate">{name}</p>
                <p title={subtitle} className="text-[12px] text-gray-500 truncate">{subtitle}</p>
            </div>
        </button>
    )
}