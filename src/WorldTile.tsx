// src/components/WorldTile.tsx
import { Compass, Clock, Loader2 } from "lucide-react";
import type { World, GameMode } from "./types";
import { formatRelativeTime } from "./types";

const GAMEMODE_STYLES: Record<GameMode, { label: string; cls: string }> = {
  survival: { label: "Survival", cls: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300" },
  creative: { label: "Creative", cls: "border-blue-500/20 bg-blue-500/10 text-blue-300" },
  hardcore: { label: "Hardcore", cls: "border-red-500/20 bg-red-500/10 text-red-300" },
  adventure: { label: "Adventure", cls: "border-amber-500/20 bg-amber-500/10 text-amber-300" },
  spectator: { label: "Spectator", cls: "border-purple-500/20 bg-purple-500/10 text-purple-300" },
};

type Props = {
  world: World;
  onClick?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
};

export default function WorldTile({ world, onClick, disabled = false, isLoading = false }: Props) {
  const modeInfo = GAMEMODE_STYLES[world.gameMode] ?? GAMEMODE_STYLES.survival;
  const diffLabel = world.difficulty.charAt(0).toUpperCase() + world.difficulty.slice(1);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      className="group flex w-full min-w-0 items-center gap-3.5 rounded-xl border border-white/5 bg-white/[0.03] p-3 text-left transition-all duration-200 hover:bg-white/[0.06] hover:border-white/10 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
    >
      {/* Иконка мира */}
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/5 group-hover:bg-white/[0.08]">
        {isLoading ? (
          <Loader2 size={20} className="animate-spin text-blue-400" />
        ) : world.iconPath ? (
          <img src={world.iconPath} alt={world.name} className="h-full w-full object-cover" />
        ) : (
          <Compass size={22} strokeWidth={1.5} className="text-gray-400" />
        )}
      </div>

      {/* Информация о мире */}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <p title={world.name} className="truncate text-[14px] font-semibold text-white">
            {world.name}
          </p>
          {world.lastPlayed && (
            <span className="flex items-center gap-1 shrink-0 text-[11px] text-gray-500">
              <Clock size={11} />
              {formatRelativeTime(new Date(world.lastPlayed).toISOString())}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`rounded-md border px-2 py-0.5 text-[11px] font-medium ${modeInfo.cls}`}>
            {modeInfo.label}
          </span>
          <span className="rounded-md border border-white/5 bg-white/[0.03] px-2 py-0.5 text-[11px] font-medium text-gray-400">
            {diffLabel}
          </span>
          {world.versionName && (
            <span className="rounded-md border border-white/5 bg-white/[0.03] px-2 py-0.5 text-[11px] font-medium text-gray-500">
              {world.versionName}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}