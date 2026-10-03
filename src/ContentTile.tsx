import { Download, Heart, Clock, ArrowUpRight, PlusCircle, Box } from "lucide-react";
import type { ContentItem, ContentTag } from "./types";
import { formatCount, formatRelativeTime } from "./types";

export type TileSize = "compact" | "default" | "large";

const LOADER_STYLES: Record<string, string> = {
  Fabric: "border-amber-400/20 bg-amber-500/10 text-amber-300",
  Forge: "border-red-400/20 bg-red-500/10 text-red-300",
  NeoForge: "border-orange-400/20 bg-orange-500/10 text-orange-300",
  Quilt: "border-purple-400/20 bg-purple-500/10 text-purple-300",
};

const genericTagCls = "border-white/5 bg-white/[0.03] text-gray-400";

export function Tag({ label, variant }: ContentTag) {
  // регистронезависимо: "Neoforge" из API тоже получит стиль NeoForge
  const key = Object.keys(LOADER_STYLES).find((k) => k.toLowerCase() === label.toLowerCase());
  const cls = variant === "loader" && key ? LOADER_STYLES[key] : genericTagCls;
  return (
    <span className={`rounded-md border px-2 py-0.5 text-[11px] font-medium ${cls}`}>
      {key ?? label}
    </span>
  );
}

const SIZES = {
  compact: {
    root: "gap-3 p-3",
    icon: "h-12 w-12 rounded-lg",
    iconSize: 20,
    title: "text-[13px] font-semibold",
    summary: "text-[12px] line-clamp-1",
    tags: false,
    meta: false,
    add: false,
  },
  default: {
    root: "gap-4 p-4",
    icon: "h-16 w-16 rounded-xl",
    iconSize: 24,
    title: "text-[14px] font-semibold",
    summary: "text-[13px] line-clamp-2",
    tags: true,
    meta: true,
    add: true,
  },
  large: {
    root: "gap-5 p-5",
    icon: "h-24 w-24 rounded-2xl",
    iconSize: 36,
    title: "text-[22px] font-bold",
    summary: "text-[14px] line-clamp-3",
    tags: true,
    meta: true,
    add: true,
  },
} as const;

type Props = {
  item: ContentItem;
  onAdd?: (item: ContentItem) => void;
  /** Клик по самой плитке (для large игнорируется) */
  onOpen?: (item: ContentItem) => void;
  addLabel?: string;
  sizeType?: TileSize;
};

export default function ContentTile({
  item,
  onAdd,
  onOpen,
  addLabel = "Add to instance",
  sizeType = "default",
}: Props) {
  const s = SIZES[sizeType];
  const isLarge = sizeType === "large";
  const clickable = !!onOpen && !isLarge;

  const stats = (
    <div
      className={
        isLarge
          ? "mt-3 flex flex-wrap items-center gap-4 text-[12.5px] text-gray-500"
          : "flex flex-col items-end gap-1 text-[12px] text-gray-500"
      }
    >
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1">
          <Download size={12} /> {formatCount(item.downloads)}
        </span>
        <span className="flex items-center gap-1">
          <Heart size={12} /> {formatCount(item.follows)}
        </span>
      </div>
      <span className="flex items-center gap-1">
        <Clock size={12} /> {formatRelativeTime(item.updatedAt)}
      </span>
    </div>
  );

  return (
    <div
      onClick={clickable ? () => onOpen?.(item) : undefined}
      className={`flex rounded-xl border border-white/5 bg-white/[0.02] transition-colors ${s.root} ${
        clickable ? "cursor-pointer hover:bg-white/[0.035]" : ""
      }`}
    >
      <div
        className={`flex shrink-0 items-center justify-center overflow-hidden bg-white/[0.04] ${s.icon} ${
          item.iconBg ?? ""
        }`}
      >
        {item.iconUrl ? (
          <img src={item.iconUrl} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <Box size={s.iconSize} className="text-gray-500" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className={`flex gap-1.5 ${isLarge ? "flex-wrap items-baseline" : "items-baseline"}`}>
          <h3 className={`text-white ${isLarge ? "" : "truncate"} ${s.title}`}>{item.name}</h3>
          <span className="shrink-0 text-[12px] text-gray-500">by {item.author}</span>
          {item.authorUrl && <ArrowUpRight size={12} className="shrink-0 text-gray-600" />}
        </div>
        <p className={`mt-0.5 leading-relaxed text-gray-400 ${s.summary}`}>{item.summary}</p>

        {s.tags && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {item.tags.map((t) => (
              <Tag key={t.label} label={t.label} variant={t.variant} />
            ))}
          </div>
        )}
        {isLarge && stats}
      </div>

      {(s.add || (s.meta && !isLarge)) && (
        <div className="flex shrink-0 flex-col items-end justify-between gap-2">
          {s.add && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation(); // чтобы не срабатывал onOpen плитки
                onAdd?.(item);
              }}
              className="flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-blue-400/20 bg-blue-500/10 px-3 py-2 text-[12.5px] font-medium text-blue-300 transition-colors hover:bg-blue-500/15 hover:border-blue-400/30 cursor-pointer active:scale-[0.98]"
            >
              <PlusCircle size={14} />
              {addLabel}
            </button>
          )}
          {s.meta && !isLarge && stats}
        </div>
      )}
    </div>
  );
}