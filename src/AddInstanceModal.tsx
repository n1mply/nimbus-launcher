import { useState, useRef } from "react"
import CustomModal from "./CustomModal"
import CustomInput, { type CustomInputOption } from "./CustomInput"
import { Instance } from "../types"
import { Box, Check, Upload, RefreshCw, Palette, ArrowLeft, Plus } from "lucide-react"

type Props = {
    isOpen: boolean
    onClose: () => void
}

// Моковые данные — заменить на реальные из window.versions.getGameVersions() / getLoaderVersions()
const MOCK_GAME_VERSIONS: CustomInputOption[] = [
    { label: "26.2", value: "26.2", isStable: false },
    { label: "26.1.2", value: "26.1.2", isStable: true },
    { label: "26.1.1", value: "26.1.1", isStable: true },
    { label: "26.1", value: "26.1", isStable: true },
    { label: "1.21.11", value: "1.21.11", isStable: true },
    { label: "1.21.10", value: "1.21.10", isStable: true },
    { label: "1.21.9", value: "1.21.9", isStable: true },
]

const MOCK_LOADER_VERSIONS: CustomInputOption[] = [
    { label: "0.19.2", value: "0.19.2" },
    { label: "0.19.1", value: "0.19.1" },
    { label: "0.19.0", value: "0.19.0" },
    { label: "0.18.6", value: "0.18.6" },
    { label: "0.18.5", value: "0.18.5" },
    { label: "0.18.4", value: "0.18.4" },
]

const LOADERS: { id: Instance["modloader"]; label: string }[] = [
    { id: "vanilla", label: "Vanilla" },
    { id: "fabric", label: "Fabric" },
    { id: "neoforge", label: "NeoForge" },
    { id: "forge", label: "Forge" },
    { id: "quilt", label: "Quilt" },
]

export default function AddInstanceModal({ isOpen, onClose }: Props) {
    const [name, setName] = useState("")
    const [modloader, setModloader] = useState<Instance["modloader"]>("vanilla")
    const [minecraftVersion, setMinecraftVersion] = useState("")
    const [loaderVersionMode, setLoaderVersionMode] = useState<"latest" | "other">("latest")
    const [loaderVersion, setLoaderVersion] = useState("")
    const [iconPreview, setIconPreview] = useState<string | null>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)

    const isLoaderSectionVisible = modloader !== "vanilla"
    const modloaderLabel = modloader.charAt(0).toUpperCase() + modloader.slice(1)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setIconPreview(URL.createObjectURL(file))
    }

    const handleModloaderSelect = (loader: Instance["modloader"]) => {
        setModloader(loader)
        // при смене загрузчика прошлый выбор версии загрузчика больше не валиден
        setLoaderVersionMode("latest")
        setLoaderVersion("")
    }

    const canSubmit =
        name.trim().length > 0 &&
        minecraftVersion.trim().length > 0 &&
        (!isLoaderSectionVisible || loaderVersionMode === "latest" || loaderVersion.trim().length > 0)

    const handleCreate = () => {
        if (!canSubmit) return
        // TODO: подключить к реальному созданию сборки через IPC
        console.log({
            name,
            modloader,
            minecraftVersion,
            modloaderVersion: isLoaderSectionVisible && loaderVersionMode === "other" ? loaderVersion : null,
            instanceIconPath: iconPreview,
        })
        onClose()
    }

    return (
        <CustomModal isOpen={isOpen} onClose={onClose} size="medium" isFlexible title="Create instance">
            <div className="flex flex-col gap-5">
                {/* Аватарка сборки */}
                <div className="flex gap-3">
                    <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/5">
                        {iconPreview ? (
                            <img src={iconPreview} alt="Instance icon" className="h-full w-full object-cover" />
                        ) : (
                            <Box size={40} strokeWidth={1.5} className="text-gray-400" />
                        )}
                    </div>
                    <div className="flex flex-col gap-2">
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-[13px] text-gray-300 transition-colors hover:bg-white/[0.06] hover:text-white cursor-pointer"
                        >
                            <Upload size={15} />
                            Upload
                        </button>
                        <button
                            type="button"
                            onClick={() => setIconPreview(null)}
                            className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-[13px] text-gray-300 transition-colors hover:bg-white/[0.06] hover:text-white cursor-pointer"
                        >
                            <RefreshCw size={15} />
                            Randomize
                        </button>
                        <button
                            type="button"
                            className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-[13px] text-gray-300 transition-colors hover:bg-white/[0.06] hover:text-white cursor-pointer"
                        >
                            <Palette size={15} />
                            Customize
                        </button>
                    </div>
                </div>

                {/* Название */}
                <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-medium text-white">Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={minecraftVersion ? `${modloaderLabel} ${minecraftVersion}` : "Instance name"}
                        className="w-full rounded-xl border border-white/5 bg-white/[0.03] py-2.5 px-3 text-[14px] text-white placeholder:text-gray-500 outline-none transition-colors focus:border-white/10 focus:bg-white/[0.05]"
                    />
                </div>

                {/* Загрузчик */}
                <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-medium text-white">Loader</label>
                    <div className="flex flex-wrap gap-2">
                        {LOADERS.map((loader) => {
                            const isSelected = modloader === loader.id
                            return (
                                <button
                                    key={loader.id}
                                    type="button"
                                    onClick={() => handleModloaderSelect(loader.id)}
                                    className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-[13px] font-medium transition-colors cursor-pointer active:scale-[0.96] transition-transform duration-150 backface-visibility-hidden will-change-transform ${
                                        isSelected
                                            ? "border-blue-400/30 bg-blue-500/10 text-blue-300"
                                            : "border-white/5 bg-white/[0.03] text-gray-400 hover:bg-white/[0.06] hover:text-white"
                                    }`}
                                >
                                    {isSelected && <Check size={16} strokeWidth={2.5}/>}
                                    {loader.label}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Версия игры */}
                <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-medium text-white">Game version</label>
                    <CustomInput
                        value={minecraftVersion}
                        onChange={setMinecraftVersion}
                        options={MOCK_GAME_VERSIONS}
                        placeholder="Select game version"
                        isListGoingUp
                        showStableToggle
                    />
                </div>

                {/* Версия загрузчика — раскрывается только если загрузчик не vanilla */}
                <div
                    className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                        isLoaderSectionVisible ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                >
                    <div className="overflow-visible">
                        <div
                            className={`flex flex-col gap-2 transition-opacity duration-200 ${
                                isLoaderSectionVisible ? "opacity-100" : "opacity-0"
                            }`}
                        >
                            <label className="text-[13px] font-medium text-white">Loader version</label>
                            <div className="flex gap-2">
                                {(["latest", "other"] as const).map((mode) => {
                                    const isSelected = loaderVersionMode === mode
                                    return (
                                        <button
                                            key={mode}
                                            type="button"
                                            onClick={() => setLoaderVersionMode(mode)}
                                            className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-[13px] font-medium transition-colors cursor-pointer ${
                                                isSelected
                                                    ? "border-blue-400/30 bg-blue-500/10 text-blue-300"
                                                    : "border-white/5 bg-white/[0.03] text-gray-400 hover:bg-white/[0.06] hover:text-white"
                                            }`}
                                        >
                                            {isSelected && <Check size={16} strokeWidth={2.5}/>}
                                            {mode === "latest" ? "Latest" : "Other"}
                                        </button>
                                    )
                                })}
                            </div>

                            {loaderVersionMode === "other" && (
                                <CustomInput
                                    value={loaderVersion}
                                    onChange={setLoaderVersion}
                                    options={MOCK_LOADER_VERSIONS}
                                    placeholder="Select loader version"
                                    isListGoingUp
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Футер */}
                <div className="mt-2 flex justify-between">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex items-center gap-1 rounded-xl border border-white/5 bg-white/[0.03] px-5 py-2.5 text-[14px] text-gray-300 transition-colors hover:bg-white/[0.06] hover:text-white cursor-pointer"
                    >
                        <ArrowLeft size={20} strokeWidth={2}/>
                        Back
                    </button>
                    <button
                        type="button"
                        onClick={handleCreate}
                        disabled={!canSubmit}
                        className="flex items-center gap-1 rounded-xl border border-blue-400/20 bg-blue-500/10 px-5 py-2.5 text-[14px] font-medium text-blue-300 transition-colors hover:bg-blue-500/15 hover:border-blue-400/30 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-blue-500/10 cursor-pointer"
                    >
                        <Plus size={20} strokeWidth={2.5}/>
                        Create instance
                    </button>
                </div>
            </div>
        </CustomModal>
    )
}