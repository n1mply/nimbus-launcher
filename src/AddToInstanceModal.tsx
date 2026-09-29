import { useEffect, useState } from "react";
import CustomModal from "./CustomModal";
import InstanceTile from "./InstanceTile";
import type { ContentItem } from "./types";
import { Loader2 } from "lucide-react";
import { useAlert } from "./contexts/alertContext";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  item: ContentItem | null;
};

export default function AddToInstanceModal({ isOpen, onClose, item }: Props) {
  const [instances, setInstances] = useState<any[]>([]);
  const [isLoadingInstances, setIsLoadingInstances] = useState(false);
  const [installingId, setInstallingId] = useState<string | null>(null);

  const { showAlert } = useAlert();

  // Загружаем список сборок при открытии
  useEffect(() => {
    if (!isOpen) {
      setInstallingId(null);
      return;
    }

    let cancelled = false;
    (async () => {
      setIsLoadingInstances(true);
      try {
        const list = await window.instancesAPI?.getAll?.();
        if (!cancelled && Array.isArray(list)) {
          setInstances(list);
        }
      } catch (err) {
        console.error("Failed to load instances:", err);
      } finally {
        if (!cancelled) setIsLoadingInstances(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const handleSelectInstance = async (inst: any) => {
    if (!item || installingId) return;

    // Папка сборки (обычно inst.folderName или inst.id или inst.name)
    const folderName = inst.folderName || inst.id || inst.name;
    setInstallingId(folderName);

    try {
      const res = await (window as any).modrinthAPI?.installToInstance?.({
        projectId: item.id,
        projectType: item.type,
        instanceFolderName: folderName,
        minecraftVersion: inst.minecraftVersion,
        modloader: inst.modloader,
      });

      if (res?.success) {
        showAlert(`Successfully added "${item.name}" to ${inst.name}!`, "success");
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (err: any) {
      showAlert(err.message || "Failed to install to this instance", "error");
    } finally {
      setInstallingId(null);
    }
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title={item ? `Add "${item.name}" to Instance` : "Add to Instance"}
      size="medium"
    >
      <div className="flex flex-col gap-4">
        {isLoadingInstances ? (
          <div className="flex h-44 flex-col items-center justify-center gap-2 text-gray-500">
            <Loader2 size={24} className="animate-spin text-blue-400" />
            <span className="text-[13px]">Loading instances...</span>
          </div>
        ) : instances.length === 0 ? (
          <div className="flex h-44 flex-col items-center justify-center text-center text-gray-500">
            <p className="text-[14px]">No instances found</p>
            <p className="text-[12px] text-gray-600 mt-1">
              Create an instance first before installing content.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-h-[420px] overflow-y-auto custom-scrollbar pr-1">
            <p className="text-[12px] text-gray-400 mb-1">
              Choose an instance to install this {item?.type}:
            </p>
            {instances.map((inst) => {
              const fName = inst.folderName || inst.id || inst.name;
              return (
                <InstanceTile
                  key={fName}
                  {...inst}
                  variant="list"
                  isLoading={installingId === fName}
                  disabled={installingId !== null}
                  onClick={() => handleSelectInstance(inst)}
                />
              );
            })}
          </div>
        )}
      </div>
    </CustomModal>
  );
}