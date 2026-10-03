import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import ContentTile from "../ContentTile";
import MarkdownView from "../MarkdownView";
import { useTab } from "../contexts/tabContext";
import { useContentInstall } from "../hooks/useContentInstall";
import type { ContentItem, ModrinthProjectDetails, ModrinthVersionSummary } from "../types";
import VersionsTab from "../VersionsTab";

type SubTab = "description" | "versions";

const SUB_TABS: { id: SubTab; label: string }[] = [
  { id: "description", label: "Description" },
  { id: "versions", label: "Versions" },
];

type Props = { item: ContentItem };

export default function ContentViewPage({ item }: Props) {
  const { closeContent } = useTab();
  const { install, modals } = useContentInstall();

  // Подвкладки — локальное состояние страницы: шапка (тайл + переключатель)
  // остаётся на месте, перерисовывается только тело
  const [subTab, setSubTab] = useState<SubTab>("description");

  const [details, setDetails] = useState<ModrinthProjectDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(true);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const [versions, setVersions] = useState<ModrinthVersionSummary[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(true);
  const [versionsError, setVersionsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const api = (window as any).modrinthAPI;

    (async () => {
      try {
        const d = await api?.getProject?.(item.id);
        if (!cancelled) setDetails(d ?? null);
      } catch (err) {
        console.error("[ContentViewPage] getProject failed:", err);
        if (!cancelled) setDetailsError("Failed to load description");
      } finally {
        if (!cancelled) setDetailsLoading(false);
      }
    })();

    (async () => {
      try {
        const v = await api?.getProjectVersions?.(item.id);
        if (!cancelled) setVersions(Array.isArray(v) ? v : []);
      } catch (err) {
        console.error("[ContentViewPage] getProjectVersions failed:", err);
        if (!cancelled) setVersionsError("Failed to load versions");
      } finally {
        if (!cancelled) setVersionsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [item.id]);

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <button
        type="button"
        onClick={closeContent}
        className="flex w-fit shrink-0 items-center gap-1.5 text-[13px] text-gray-400 transition-colors hover:text-white cursor-pointer"
      >
        <ArrowLeft size={15} />
        Back
      </button>

      <div className="shrink-0">
        <ContentTile item={item} sizeType="large" onAdd={install} />
      </div>

      <div className="inline-flex w-fit shrink-0 gap-1 rounded-xl border border-white/5 bg-white/[0.03] p-1">
        {SUB_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSubTab(t.id)}
            className={`rounded-lg border px-4 py-1.5 text-[13px] font-medium transition-colors cursor-pointer ${
              subTab === t.id
                ? "border-blue-400/30 bg-blue-500/20 text-blue-300"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1">
        {subTab === "description" ? (
          <div className="custom-scrollbar h-full overflow-y-auto rounded-xl border border-white/5 bg-white/[0.02] p-5">
            {detailsLoading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 size={32} className="animate-spin text-blue-400" />
              </div>
            ) : detailsError ? (
              <p className="text-center text-[14px] text-gray-500">{detailsError}</p>
            ) : details?.body ? (
              <MarkdownView>{details.body}</MarkdownView>
            ) : (
              <p className="text-center text-[14px] text-gray-500">No description</p>
            )}
          </div>
        ) : (
          <VersionsTab
            item={item}
            versions={versions}
            isLoading={versionsLoading}
            error={versionsError}
          />
        )}
      </div>

      {modals}
    </div>
  );
}