// src/components/DependenciesModal.tsx
import CustomModal from "./CustomModal";
import ContentTile from "./ContentTile";
import type { ContentItem } from "./types";
import { Puzzle, Loader2, ArrowRight } from "lucide-react";
import { useState } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  mainItemName: string;
  dependencies: ContentItem[];
  onConfirmInstall: (withDeps: boolean) => Promise<void> | void;
};

export default function DependenciesModal({
  isOpen,
  onClose,
  mainItemName,
  dependencies,
  onConfirmInstall,
}: Props) {
  const [loadingType, setLoadingType] = useState<"all" | "only" | null>(null);

  const handleInstallAll = async () => {
    setLoadingType("all");
    try {
      await onConfirmInstall(true);
    } finally {
      setLoadingType(null);
    }
  };

  const handleInstallOnly = async () => {
    setLoadingType("only");
    try {
      await onConfirmInstall(false);
    } finally {
      setLoadingType(null);
    }
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Required Dependencies"
      size="medium"
    >
      <div className="flex flex-col gap-4">
        {/* Информационный баннер */}
        <div className="flex items-start gap-3 rounded-xl border border-blue-500/20 bg-blue-500/10 p-3.5 text-blue-200">
          <Puzzle className="mt-0.5 shrink-0 text-blue-400" size={18} />
          <p className="text-[13px] leading-relaxed">
            <span className="font-semibold text-white">{mainItemName}</span> requires additional
            mod(s) to function properly.
          </p>
        </div>

        {/* Список зависимостей */}
        <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
          {dependencies.map((dep) => (
            <ContentTile key={dep.id} item={dep} sizeType="compact"/>
          ))}
        </div>

        {/* Кнопки действий */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/5">
          <button
            type="button"
            disabled={loadingType !== null}
            onClick={onClose}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-[13px] font-medium text-gray-300 transition-colors hover:bg-white/10 hover:text-white cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={loadingType !== null}
            onClick={handleInstallOnly}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-[13px] font-medium text-gray-300 transition-colors hover:bg-white/10 hover:text-white cursor-pointer disabled:opacity-50"
          >
            {loadingType === "only" ? (
              <Loader2 size={14} className="animate-spin inline mr-1.5" />
            ) : null}
            Install mod only
          </button>

          <button
            type="button"
            disabled={loadingType !== null}
            onClick={handleInstallAll}
            className="flex items-center gap-1.5 rounded-lg border border-blue-400/30 bg-blue-500/20 px-4 py-2 text-[13px] font-semibold text-blue-300 transition-colors hover:bg-blue-500/30 cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {loadingType === "all" ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <ArrowRight size={14} />
            )}
            Install with dependencies
          </button>
        </div>
      </div>
    </CustomModal>
  );
}