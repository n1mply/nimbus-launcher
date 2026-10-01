import { useEffect, useMemo, useState, type ReactNode } from "react";
import { SearchX, Loader2 } from "lucide-react";
import ContentTile from "../ContentTile";
import ContentFilterBar, { type FilterDef } from "../ContentFilterBar";
import CustomInput, { type CustomInputOption } from "../CustomInput";
import Pagination from "../Pagination";
import type { ContentItem, ContentType } from "../types";
import { useLauncher } from "../contexts/laucherContext";
import AddToInstanceModal from "../AddToInstanceModal";
import { useAlert } from "../contexts/alertContext";
import InstallationModal from "../InstallationModal";

type Props = {
  contentType: ContentType;
  icon: ReactNode;
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  addLabel?: string;
};

const MODRINTH_PROJECT_TYPE: Record<ContentType, string> = {
  mod: "mod",
  shader: "shader",
  resourcepack: "resourcepack",
  modpack: "modpack",
  datapack: "datapack",
};

const SORT_API_MAP: Record<
  string,
  "relevance" | "downloads" | "follows" | "newest" | "updated"
> = {
  popularity: "relevance",
  downloads: "downloads",
  updated: "updated",
  newest: "newest",
};

const PAGE_SIZE = 15;

const FALLBACK_TYPE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "library", label: "Library" },
  { value: "optimization", label: "Optimization" },
  { value: "utility", label: "Utility" },
  { value: "decoration", label: "Decoration" },
];

export default function ContentBrowserPage({
  contentType,
  icon,
  title,
  subtitle,
  searchPlaceholder,
  addLabel,
}: Props) {
  const { versions } = useLauncher();
  const { showAlert } = useAlert();

  const versionOptions: CustomInputOption[] = useMemo(() => {
    return (versions ?? [])
      .filter((v) => v.type === "release")
      .map((v) => ({ label: v.id, value: v.id }));
  }, [versions]);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sortBy, setSortBy] = useState("popularity");
  const [modloader, setModloader] = useState("all");
  const [version, setVersion] = useState("");
  const [category, setCategory] = useState("all");
  const [typeOptions, setTypeOptions] = useState(FALLBACK_TYPE_OPTIONS);

  const [items, setItems] = useState<ContentItem[]>([]);
  const [totalHits, setTotalHits] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [installingModpackInstance, setInstallingModpackInstance] = useState<any | null
  >(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);

  const handleAddClick = async (item: ContentItem) => {
    if (item.type === "modpack") {
      if (isPreparing) return;
      setIsPreparing(true);
      showAlert(`Preparing "${item.name}"...`, "default");

      try {
        const inst = await (window as any).modrinthAPI?.installModpack?.({
          projectId: item.id,
          name: item.name,
          iconUrl: item.iconUrl,
        });

        if (inst) {
          setInstallingModpackInstance(inst);
          setIsInstallModalOpen(true);
        }
      } catch (err: any) {
        console.error("Modpack install error:", err);
        showAlert(err.message || "Failed to install modpack", "error");
      } finally {
        setIsPreparing(false);
      }
      return;
    }

    // Для модов, ресурспаков и шейдеров открываем модалку:
    setSelectedItem(item);
    setShowModal(true);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const projectType = MODRINTH_PROJECT_TYPE[contentType];
        const categories = await (window as any).modrinthAPI?.getCategories?.(
          projectType,
        );
        if (cancelled || !Array.isArray(categories) || categories.length === 0)
          return;

        setTypeOptions([
          { value: "all", label: "All" },
          ...categories.map((c: { name: string }) => ({
            value: c.name,
            label: c.name.charAt(0).toUpperCase() + c.name.slice(1),
          })),
        ]);
      } catch (err) {
        console.warn(
          "[ContentBrowserPage] Failed to load Modrinth categories:",
          err,
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [contentType]);

  useEffect(() => {
    let cancelled = false;

    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const projectType = MODRINTH_PROJECT_TYPE[contentType];
        const offset = (page - 1) * PAGE_SIZE;

        const res = await (window as any).modrinthAPI?.searchProjects?.({
          query: debouncedQuery,
          projectType,
          loader: modloader !== "all" ? modloader : undefined,
          version: version ? version : undefined,
          category: category !== "all" ? category : undefined,
          sortBy: SORT_API_MAP[sortBy] ?? "relevance",
          limit: PAGE_SIZE,
          offset,
        });

        if (cancelled || !res) return;

        const mappedItems: ContentItem[] = res.hits.map((hit: any) => {
          const knownLoaders = ["fabric", "forge", "neoforge", "quilt"];
          const tags = (hit.categories || []).map((cat: string) => {
            const isLoader = knownLoaders.includes(cat.toLowerCase());
            return {
              label: cat.charAt(0).toUpperCase() + cat.slice(1),
              variant: isLoader ? "loader" : "generic",
            };
          });

          return {
            id: hit.project_id,
            name: hit.title,
            author: hit.author,
            summary: hit.description,
            iconUrl: hit.icon_url,
            downloads: hit.downloads,
            follows: hit.follows,
            updatedAt: hit.date_modified,
            type: contentType,
            tags,
          };
        });

        setItems(mappedItems);
        setTotalHits(res.total_hits);
      } catch (err) {
        console.error("[ContentBrowserPage] Failed to fetch items:", err);
        setItems([]);
        setTotalHits(0);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchProjects();

    return () => {
      cancelled = true;
    };
  }, [contentType, debouncedQuery, modloader, version, category, sortBy, page]);

  const totalPages = Math.ceil(totalHits / PAGE_SIZE);

  const filters: FilterDef[] = [
    {
      key: "sort",
      label: "Sort by",
      value: sortBy,
      options: [
        { value: "popularity", label: "Popularity" },
        { value: "downloads", label: "Downloads" },
        { value: "updated", label: "Recently updated" },
        { value: "newest", label: "Newest" },
      ],
    },
    {
      key: "modloader",
      label: "Modloader",
      value: modloader,
      options: [
        { value: "all", label: "All" },
        { value: "fabric", label: "Fabric" },
        { value: "forge", label: "Forge" },
        { value: "neoforge", label: "NeoForge" },
        { value: "quilt", label: "Quilt" },
      ],
    },
    {
      key: "category",
      label: "Type",
      value: category,
      options: typeOptions,
    },
  ];

  const handleFilterChange = (key: string, value: string) => {
    setPage(1);
    if (key === "sort") setSortBy(value);
    if (key === "modloader") setModloader(value);
    if (key === "category") setCategory(value);
  };

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex flex-col gap-1">
        <h1 className="flex items-center gap-2 text-[16px] font-medium text-white">
          {icon}
          {title}
        </h1>
        <p className="text-[14px] text-gray-500">{subtitle}</p>
      </div>

      <ContentFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={searchPlaceholder}
        filters={filters}
        onFilterChange={handleFilterChange}
        extraFilters={
          <div className="flex w-44 items-center gap-2">
            <span className="whitespace-nowrap text-[13px] text-gray-500">
              Version:
            </span>

            <CustomInput
              value={version}
              onChange={(val) => {
                setVersion(val);
                setPage(1);
              }}
              options={versionOptions}
              placeholder="All"
              isClearableOnClick
            />
          </div>
        }
      />

      <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-gray-500">
            <Loader2 size={32} className="animate-spin text-blue-400" />
            <p className="text-[14px]">Searching Modrinth...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-gray-500">
            <SearchX size={48} strokeWidth={1.15} className="text-gray-600" />
            <p className="text-[14px]">No results found</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <ContentTile
                key={item.id}
                item={item}
                addLabel={addLabel}
                onAdd={handleAddClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Пагинация внизу страницы */}
      {totalPages > 1 && (
        <div className="shrink-0 border-t border-white/5 pt-2">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>
      )}
      <AddToInstanceModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedItem(null);
        }}
        item={selectedItem}
      />
      <InstallationModal
        isOpen={isInstallModalOpen}
        instance={installingModpackInstance}
        onClose={() => {
          setIsInstallModalOpen(false);
          setInstallingModpackInstance(null);
        }}
        onSuccess={() => {
          showAlert(
            `"${installingModpackInstance?.name}" installed successfully!`,
            "default",
          );
        }}
      />
    </div>
  );
}
