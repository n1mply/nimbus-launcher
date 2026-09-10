import { useState, useMemo, useEffect, useCallback } from "react";
import { Instance } from "../types";
import InstanceTile from "../InstanceTile";
import { Plus, Search, PackageOpen, SearchX, Loader2 } from "lucide-react";
import { LayoutGrid, List } from "lucide";
import { MorphIcon } from "morphicons/react";
import AddInstanceModal from "../AddInstanceModal";
import AbsoluteGameBar from "../AbsoluteGameBar";

export default function InstancesPage() {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [selectedInstance, setSelectedInstance] = useState<Instance | null>(
    null,
  );

  const loadInstances = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await window.instancesAPI.getAll();
      setInstances(data);
    } catch (error) {
      console.error("Failed to fetch instances:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInstances();
  }, [loadInstances]);

  const filteredInstances = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return instances;
    return instances.filter((instance) =>
      instance.name.toLowerCase().includes(query),
    );
  }, [instances, searchQuery]);

  const hasNoInstancesAtAll = !isLoading && instances.length === 0;
  const hasNoSearchResults =
    !hasNoInstancesAtAll && !isLoading && filteredInstances.length === 0;

  return (
    <div className="p-4 flex flex-col gap-4 h-full">
      <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(6px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>

      {/* Шапка */}
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-[16px] font-medium">Instances</h1>
          <p className="text-[14px] text-gray-500">
            {isLoading
              ? "Loading instances..."
              : instances.length === 0
                ? "You haven't installed any instances yet."
                : `${instances.length} instances`}
          </p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="flex gap-1 items-center rounded-xl border border-blue-400/20 bg-blue-500/10 py-3 px-6 text-blue-300 hover:bg-blue-500/15 hover:border-blue-400/30 cursor-pointer transition-colors active:scale-[0.99] transition-transform duration-150 backface-visibility-hidden will-change-transform"
        >
          <Plus size={20} strokeWidth={2.5} />
          <p className="text-[14px] font-medium">Add instance</p>
        </button>
      </div>

      {/* Панель поиска и переключения вида */}
      <div className="flex flex-row gap-2">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search instances..."
            className="w-full rounded-xl border border-white/5 bg-white/[0.03] py-2.5 pl-10 pr-3 text-[14px] text-white placeholder:text-gray-500 outline-none transition-colors focus:border-white/10 focus:bg-white/[0.05]"
          />
        </div>
        <button
          onClick={() => setViewMode((v) => (v === "grid" ? "list" : "grid"))}
          aria-label="Toggle view mode"
          aria-pressed={viewMode === "list"}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/5 bg-white/[0.03] text-gray-400 transition-colors hover:bg-white/[0.06] hover:text-white cursor-pointer active:scale-[0.95] transition-transform duration-150"
        >
          <MorphIcon
            icon={viewMode === "grid" ? LayoutGrid : List}
            size={18}
            spring="snappy"
          />
        </button>
      </div>

      {/* Контентная область */}
      <div className="flex-1 min-h-0">
        {isLoading ? (
          /* Лоадер при первичном поиске / загрузке */
          <div className="flex flex-col items-center justify-center h-full gap-3 mb-10 text-center text-gray-500">
            <Loader2 size={32} className="animate-spin text-blue-400" />
            <p className="text-[14px]">Loading your instances...</p>
          </div>
        ) : hasNoInstancesAtAll || hasNoSearchResults ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 mb-10 text-center">
            {hasNoSearchResults ? (
              <SearchX size={56} strokeWidth={1.15} className="text-gray-600" />
            ) : (
              <PackageOpen
                size={56}
                strokeWidth={1.15}
                className="text-gray-600"
              />
            )}
            <p className="text-[14px] text-gray-500">
              {hasNoSearchResults
                ? `No instances found for "${searchQuery}"`
                : "No instances yet — create one to get started"}
            </p>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-5 gap-4"
                : "flex flex-col gap-2"
            }
          >
            {filteredInstances.map((instance, index) => (
              <div
                key={`${instance.id || instance.name}-${viewMode}`}
                onClick={() => setSelectedInstance(instance)}
                className="min-w-0 cursor-pointer active:scale-[0.99] transition-transform duration-150 will-change-transform"
                style={{
                  animation: "fadeInUp 0.2s ease-out both",
                  animationDelay: `${index * 25}ms`,
                }}
              >
                <InstanceTile {...instance} variant={viewMode} />
              </div>
            ))}
          </div>
        )}
      </div>

      <AddInstanceModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={loadInstances}
      />
      <AbsoluteGameBar
        instance={selectedInstance}
        onClose={() => setSelectedInstance(null)}
      />
    </div>
  );
}
