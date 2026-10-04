import { useMemo, useState } from "react";
import CustomModal from "./CustomModal";
import { Check, Info, RefreshCw, Save, X } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  /** Получает готовую иконку как PNG data URL (512x512) */
  onSave: (dataUrl: string) => void;
};

/* ----------------------------- Иконки из assets ---------------------------- */

// Ожидается структура: src/assets/{mobs,blocks,icons,items}/*.(webp|png)
// Путь указан относительно этого файла — поправь, если компонент лежит в другом месте.
const ICON_SOURCES = import.meta.glob("./assets/*/*.{webp,png}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const CATEGORIES = [
  { id: "mobs", label: "Mobs" },
  { id: "blocks", label: "Blocks" },
  { id: "icons", label: "Icons" },
  { id: "items", label: "Items" },
] as const;

type CategoryId = (typeof CATEGORIES)[number]["id"];

type IconEntry = {
  id: string;
  name: string;
  url: string;
  category: CategoryId;
};

const ICONS: IconEntry[] = Object.entries(ICON_SOURCES)
  .flatMap(([path, url]) => {
    const match = path.match(/\/assets\/([^/]+)\/([^/]+)\.(?:webp|png)$/);
    if (!match) return [];

    const category = match[1] as CategoryId;
    if (!CATEGORIES.some((c) => c.id === category)) return [];

    return [
      {
        id: path,
        name: match[2].replace(/[_-]+/g, " "),
        url,
        category,
      },
    ];
  })
  .sort((a, b) => a.name.localeCompare(b.name));

/* -------------------------------- Градиенты -------------------------------- */

type Gradient = { id: string; from: string; to: string };

// from — верх, to — низ (как в Modrinth: сверху насыщеннее, снизу светлее)
const GRADIENTS: Gradient[] = [
  { id: "pink", from: "#D6306A", to: "#F8586A" },
  { id: "orange", from: "#FF8A22", to: "#FFAB55" },
  { id: "yellow", from: "#FFC82E", to: "#FFE45A" },
  { id: "lime", from: "#7BE322", to: "#B8F53C" },
  { id: "green", from: "#12A02A", to: "#3CCB52" },
  { id: "indigo", from: "#4A4AFF", to: "#7A7AFF" },
  { id: "blue", from: "#1B6EF3", to: "#4FA3FF" },
  { id: "cyan", from: "#0FA3B8", to: "#4FD6E6" },
  { id: "teal", from: "#0F8F7A", to: "#3FD1B4" },
  { id: "purple", from: "#8A2BE2", to: "#C05CFF" },
  { id: "magenta", from: "#C21E8F", to: "#F05CC0" },
  { id: "red", from: "#C4262E", to: "#F25C54" },
  { id: "slate", from: "#2E3340", to: "#5A6275" },
  { id: "white", from: "#ffffff", to: "#fcdff2" },
];

/* -------------------------------- Рендер PNG ------------------------------- */

const OUTPUT_SIZE = 512;
const ICON_SCALE = 0.7; // доля холста, которую занимает иконка (то же значение в превью)

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load icon image"));
    img.src = src;
  });

async function renderIcon(
  gradient: Gradient,
  iconUrl: string,
): Promise<string> {
  const size = OUTPUT_SIZE;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported");

  const bg = ctx.createLinearGradient(0, 0, 0, size);
  bg.addColorStop(0, gradient.from);
  bg.addColorStop(1, gradient.to);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  const img = await loadImage(iconUrl);
  const target = size * ICON_SCALE;
  const scale = Math.min(target / img.width, target / img.height);
  const w = img.width * scale;
  const h = img.height * scale;

  ctx.imageSmoothingEnabled = false; // пиксель-арт без размытия
  ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
  ctx.shadowBlur = size * 0.03;
  ctx.shadowOffsetY = size * 0.02;
  ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);

  return canvas.toDataURL("image/png");
}

/* -------------------------------- Компонент -------------------------------- */

const randomItem = <T,>(items: T[]): T =>
  items[Math.floor(Math.random() * items.length)];

export default function IconEditorModal({ isOpen, onClose, onSave }: Props) {
  const availableCategories = CATEGORIES.filter((c) =>
    ICONS.some((icon) => icon.category === c.id),
  );

  const [gradientId, setGradientId] = useState(GRADIENTS[0].id);
  const [category, setCategory] = useState<CategoryId>(
    availableCategories[0]?.id ?? "mobs",
  );
  const [iconId, setIconId] = useState<string | null>(
    ICONS.find((i) => i.category === (availableCategories[0]?.id ?? "mobs"))
      ?.id ?? null,
  );
  const [isSaving, setIsSaving] = useState(false);

  const gradient = GRADIENTS.find((g) => g.id === gradientId) ?? GRADIENTS[0];
  const selectedIcon = ICONS.find((i) => i.id === iconId) ?? null;

  const visibleIcons = useMemo(
    () => ICONS.filter((icon) => icon.category === category),
    [category],
  );

  const handleRandomize = () => {
    setGradientId(randomItem(GRADIENTS).id);
    if (ICONS.length === 0) return;
    const icon = randomItem(ICONS);
    setCategory(icon.category);
    setIconId(icon.id);
  };

  const handleSave = async () => {
    if (!selectedIcon || isSaving) return;

    try {
      setIsSaving(true);
      const dataUrl = await renderIcon(gradient, selectedIcon.url);
      onSave(dataUrl);
      onClose();
    } catch (err) {
      console.error("Failed to render icon:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const pillClass = (isSelected: boolean) =>
    `flex items-center gap-1.5 rounded-full border px-4 py-2 text-[13px] font-medium transition-colors cursor-pointer backface-visibility-hidden will-change-transform ${
      isSelected
        ? "border-blue-400/30 bg-blue-500/10 text-blue-300"
        : "border-white/5 bg-white/[0.03] text-gray-400 hover:bg-white/[0.06] hover:text-white"
    }`;

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      size="large"
      title="Icon editor"
      closeOnOutsideClick={false}
    >
      <div className="flex flex-col gap-5">
        <div className="flex h-[460px] gap-5">
          {/* Левая колонка: превью + randomize */}
          <div className="flex w-44 shrink-0 flex-col gap-3">
            <div className="flex aspect-square w-full items-center justify-center rounded-2xl border border-white/5 bg-white/[0.03] p-3">
              <div
                className="relative h-full w-full overflow-hidden rounded-2xl"
                style={{
                  background: `linear-gradient(to bottom, ${gradient.from}, ${gradient.to})`,
                }}
              >
                {selectedIcon && (
                  <img
                    src={selectedIcon.url}
                    alt={selectedIcon.name}
                    draggable={false}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 object-contain"
                    style={{
                      width: `${ICON_SCALE * 100}%`,
                      height: `${ICON_SCALE * 100}%`,
                      imageRendering: "pixelated",
                      filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.25))",
                    }}
                  />
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleRandomize}
              className="backface-visibility-hidden will-change-transform flex items-center justify-center gap-2 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-[13px] text-gray-300 transition-colors hover:bg-white/[0.06] hover:text-white cursor-pointer"
            >
              <RefreshCw size={15} />
              Randomize
            </button>
          </div>

          {/* Правая колонка: фон + иконки */}
          <div className="flex min-w-0 flex-1 flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-medium text-white">
                Background
              </label>
              <div className="flex gap-2 custom-scrollbar overflow-x-auto p-1">
                {GRADIENTS.map((g) => {
                  const isSelected = g.id === gradientId;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setGradientId(g.id)}
                      className={`relative h-12 w-12 shrink-0 rounded-xl border transition-transform duration-150 cursor-pointer active:scale-[0.94] ${
                        isSelected
                          ? "border-white/60"
                          : "border-white/5 hover:border-white/20"
                      }`}
                      style={{
                        background: `linear-gradient(to bottom, ${g.from}, ${g.to})`,
                      }}
                    >
                      {isSelected && (
                        <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white/90 text-black">
                          <Check size={11} strokeWidth={3} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-2">
              <label className="text-[13px] font-medium text-white">Icon</label>

              <div className="flex flex-wrap gap-2">
                {availableCategories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id)}
                    className={pillClass(category === c.id)}
                  >
                    {category === c.id && <Check size={16} strokeWidth={2.5} />}
                    {c.label}
                  </button>
                ))}
              </div>

              <div className="min-h-0 custom-scrollbar flex-1 overflow-y-auto pr-1">
                {visibleIcons.length === 0 ? (
                  <p className="py-6 text-center text-[13px] text-gray-500">
                    No icons found
                  </p>
                ) : (
                  <div className="grid grid-cols-5 gap-2 p-1">
                    {visibleIcons.map((icon) => {
                      const isSelected = icon.id === iconId;
                      return (
                        <button
                          key={icon.id}
                          type="button"
                          title={icon.name}
                          onClick={() => setIconId(icon.id)}
                          className={`backface-visibility-hidden will-change-transform relative aspect-square overflow-hidden rounded-xl border transition-colors cursor-pointer active:scale-[0.96] transition-transform duration-150 ${
                            isSelected
                              ? "border-blue-400/30 bg-blue-500/10"
                              : "border-white/5 bg-white/[0.03] hover:bg-white/[0.06]"
                          }`}
                        >
                          <img
                            src={icon.url}
                            alt={icon.name}
                            loading="lazy"
                            draggable={false}
                            className="absolute inset-2 h-[calc(100%-1rem)] w-[calc(100%-1rem)] object-contain"
                            style={{ imageRendering: "pixelated" }}
                          />
                          {isSelected && (
                            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-300 text-[#14151C]">
                              <Check size={11} strokeWidth={3} />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Футер */}
        <div className="flex items-center justify-between gap-3 border-t border-white/5 pt-4">
          <div className="flex items-center gap-2 text-[13px] text-gray-400">
            <Info size={16} className="shrink-0 text-blue-400" />
            Combine elements to create an icon.
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="backface-visibility-hidden will-change-transform flex items-center gap-1 rounded-xl border border-white/5 bg-white/[0.03] px-5 py-2.5 text-[14px] text-gray-300 transition-colors hover:bg-white/[0.06] hover:text-white cursor-pointer"
            >
              <X size={18} strokeWidth={2} />
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!selectedIcon || isSaving}
              className="backface-visibility-hidden will-change-transform flex items-center gap-1 rounded-xl border border-blue-400/20 bg-blue-500/10 px-5 py-2.5 text-[14px] font-medium text-blue-300 transition-colors hover:bg-blue-500/15 hover:border-blue-400/30 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-blue-500/10 cursor-pointer"
            >
              <Save size={18} strokeWidth={2.5} />
              Save icon
            </button>
          </div>
        </div>
      </div>
    </CustomModal>
  );
}
