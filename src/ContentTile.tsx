// Добавь/обнови импорт Box или аналогичной иконки для заглушки
import { Download, Heart, Clock, ArrowUpRight, PlusCircle, Box } from "lucide-react";
import type { ContentItem, ContentTag } from "./types";
import { formatCount, formatRelativeTime } from "./types";

const LOADER_STYLES: Record<string, string> = {
  Fabric: "border-amber-400/20 bg-amber-500/10 text-amber-300",
  Forge: "border-red-400/20 bg-red-500/10 text-red-300",
  NeoForge: "border-orange-400/20 bg-orange-500/10 text-orange-300",
  Quilt: "border-purple-400/20 bg-purple-500/10 text-purple-300",
};

const genericTagCls = "border-white/5 bg-white/[0.03] text-gray-400";

function Tag({ label, variant }: ContentTag) {
  const cls = variant === "loader" ? (LOADER_STYLES[label] ?? genericTagCls) : genericTagCls;
  return (
    <span className={`rounded-md border px-2 py-0.5 text-[11px] font-medium ${cls}`}>
      {label}
    </span>
  );
}

type Props = {
  item: ContentItem;
  onAdd?: (item: ContentItem) => void;
  addLabel?: string;
  isCompact?: boolean;
};

export default function ContentTile({
  item,
  onAdd,
  addLabel = "Add to instance",
  isCompact = false,
}: Props) {
  return (
    <div className="flex gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.035]">
      <div
        className={`flex h-16 w-16 shrink-0 overflow-hidden items-center justify-center rounded-xl bg-white/[0.04] ${
          item.iconBg ?? ""
        }`}
      >
        {item.iconUrl ? (
          <img
            src={item.iconUrl}
            alt={item.name}
            className="h-full w-full object-cover rounded-xl"
            loading="lazy"
          />
        ) : item.iconUrl ? (
          item.iconUrl
        ) : (
          <Box size={24} className="text-gray-500" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-1.5">
          <h3 className="truncate text-[14px] font-semibold text-white">{item.name}</h3>
          <span className="shrink-0 text-[12px] text-gray-500">by {item.author}</span>
          {item.authorUrl && <ArrowUpRight size={12} className="shrink-0 text-gray-600" />}
        </div>
        <p className="mt-0.5 line-clamp-2 text-[13px] leading-relaxed text-gray-400">
          {item.summary}
        </p>
        {!isCompact && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {item.tags.map((t) => (
              <Tag key={t.label} label={t.label} variant={t.variant} />
            ))}
          </div>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-end justify-between gap-2">
        {!isCompact && (
          <button
            type="button"
            onClick={() => onAdd?.(item)}
            className="flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-blue-400/20 bg-blue-500/10 px-3 py-2 text-[12.5px] font-medium text-blue-300 transition-colors hover:bg-blue-500/15 hover:border-blue-400/30 cursor-pointer active:scale-[0.98]"
          >
            <PlusCircle size={14} />
            {addLabel}
          </button>
        )}
        {!isCompact && (
          <div className="flex flex-col items-end gap-1 text-[12px] text-gray-500">
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
        )}
      </div>
    </div>
  );
}