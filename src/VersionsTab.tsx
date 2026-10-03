import { useMemo, useState } from "react";
import { Download, ExternalLink, Loader2, SearchX } from "lucide-react";
import CustomInput, { type CustomInputOption } from "./CustomInput";
import CustomSelect from "./CustomSelect";
import Pagination from "./Pagination";
import { Tag } from "./ContentTile";
import { openExternal } from "./utils/openExternal";
import { formatCount, formatRelativeTime } from "./types";
import type { ContentItem, ModrinthVersionSummary } from "./types";

const PAGE_SIZE = 10;

const CHANNEL_OPTIONS: CustomInputOption[] = [
  { value: "all", label: "All channels" },
  { value: "release", label: "Release" },
  { value: "beta", label: "Beta" },
  { value: "alpha", label: "Alpha" },
];

const CHANNEL_BADGE: Record<string, { letter: string; cls: string }> = {
  release: { letter: "R", cls: "border-emerald-400/20 bg-emerald-500/10 text-emerald-300" },
  beta: { letter: "B", cls: "border-amber-400/20 bg-amber-500/10 text-amber-300" },
  alpha: { letter: "A", cls: "border-red-400/20 bg-red-500/10 text-red-300" },
};

const KNOWN_LOADERS = ["fabric", "forge", "neoforge", "quilt"];

const GRID =
  "grid grid-cols-[minmax(0,2.2fr)_minmax(0,1.6fr)_minmax(0,1.5fr)_110px_80px_76px] items-center gap-3 px-4";

type Props = {
  item: ContentItem;
  versions: ModrinthVersionSummary[];
  isLoading: boolean;
  error?: string | null;
  onInstall?: (versionId: string) => void;
};

function VersionRow({
  v,
  item,
  onInstall,
}: {
  v: ModrinthVersionSummary;
  item: ContentItem;
  onInstall?: (versionId: string) => void;
}) {
  const badge = CHANNEL_BADGE[v.version_type] ?? CHANNEL_BADGE.release;
  const games = [...v.game_versions].reverse();
  const shown = games.slice(0, 2);
  const rest = games.length - shown.length;
  const url = `https://modrinth.com/${item.type}/${item.slug ?? item.id}/version/${v.id}`;

  return (
    <div className={`${GRID} border-t border-white/5 py-3 text-[13px] text-gray-300`}>
      <div className="flex min-w-0 items-center gap-3">
        <span
          title={v.version_type}
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-[12px] font-bold ${badge.cls}`}
        >
          {badge.letter}
        </span>
        <div className="min-w-0">
          <p className="truncate font-semibold text-white">{v.version_number}</p>
          {v.name && v.name !== v.version_number && (
            <p className="truncate text-[12px] text-gray-500">{v.name}</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5" title={games.join(", ")}>
        {shown.map((g) => (
          <Tag key={g} label={g} variant="generic" />
        ))}
        {rest > 0 && <span className="text-[11px] text-gray-500">+{rest}</span>}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {v.loaders.map((l) => (
          <Tag
            key={l}
            label={l.charAt(0).toUpperCase() + l.slice(1)}
            variant={KNOWN_LOADERS.includes(l) ? "loader" : "generic"}
          />
        ))}
      </div>

      <span className="text-gray-400">{formatRelativeTime(v.date_published)}</span>
      <span className="text-gray-400">{formatCount(v.downloads)}</span>

      <div className="flex items-center justify-end gap-1">
        {onInstall && (
          <button
            type="button"
            title="Install this version"
            onClick={() => onInstall(v.id)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-blue-300 transition-colors hover:bg-blue-500/10 cursor-pointer active:scale-[0.95]"
          >
            <Download size={16} />
          </button>
        )}
        <button
          type="button"
          title="Open on Modrinth"
          onClick={() => openExternal(url)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-white/[0.05] hover:text-white cursor-pointer"
        >
          <ExternalLink size={16} />
        </button>
      </div>
    </div>
  );
}

export default function VersionsTab({ item, versions, isLoading, error, onInstall }: Props) {
  const [channel, setChannel] = useState("all");
  const [gameVersion, setGameVersion] = useState("");
  const [page, setPage] = useState(1);

  const gameVersionOptions: CustomInputOption[] = useMemo(() => {
    const seen = new Set<string>();
    // versions приходят новыми первыми, так что и список игровых версий получается «свежие сверху»
    for (const v of versions) for (const g of [...v.game_versions].reverse()) seen.add(g);
    return [...seen].map((g) => ({ label: g, value: g }));
  }, [versions]);

  const filtered = useMemo(() => {
    const q = gameVersion.trim();
    return versions.filter(
      (v) =>
        (channel === "all" || v.version_type === channel) &&
        (!q || v.game_versions.some((g) => g.startsWith(q))),
    );
  }, [versions, channel, gameVersion]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (isLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-gray-500">
        <Loader2 size={32} className="animate-spin text-blue-400" />
        <p className="text-[14px]">Loading versions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-[14px] text-gray-500">{error}</div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex shrink-0 items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="whitespace-nowrap text-[13px] text-gray-500">Channel:</span>
          <CustomSelect
            value={channel}
            onChange={(v) => {
              setChannel(v);
              setPage(1);
            }}
            options={CHANNEL_OPTIONS}
          />
        </div>
        <div className="flex w-52 items-center gap-2">
          <span className="whitespace-nowrap text-[13px] text-gray-500">Game version:</span>
          <CustomInput
            value={gameVersion}
            onChange={(v) => {
              setGameVersion(v);
              setPage(1);
            }}
            options={gameVersionOptions}
            placeholder="All"
            isClearableOnClick
          />
        </div>
      </div>

      <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto">
        {pageItems.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-gray-500">
            <SearchX size={48} strokeWidth={1.15} className="text-gray-600" />
            <p className="text-[14px]">No versions match the filters</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-white/5 bg-white/[0.02]">
            <div className={`${GRID} py-2.5 text-[12px] font-medium text-gray-500`}>
              <span>Version</span>
              <span>Game version</span>
              <span>Platform</span>
              <span>Published</span>
              <span>Downloads</span>
              <span />
            </div>
            {pageItems.map((v) => (
              <VersionRow key={v.id} v={v} item={item} onInstall={onInstall} />
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="shrink-0 border-t border-white/5 pt-2">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}