import { useEffect, useState } from "react";
import CustomModal from "./CustomModal";
import InstanceTile from "./InstanceTile";
import type { ContentItem } from "./types";
import { Loader2 } from "lucide-react";
import { useAlert } from "./contexts/alertContext";
import DependenciesModal from "./DependenciesModal";
import ConfirmModal from "./ConfirmModal";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  item: ContentItem | null;
};

export default function AddToInstanceModal({ isOpen, onClose, item }: Props) {
  const [instances, setInstances] = useState<any[]>([]);
  const [isLoadingInstances, setIsLoadingInstances] = useState(false);
  const [installingId, setInstallingId] = useState<string | null>(null);

  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [showDepsModal, setShowDepsModal] = useState(false);

  const { showAlert } = useAlert();

  const [pendingInstall, setPendingInstall] = useState<{
    instance: any;
    version: any;
    missingDependencies: any[];
    existingFileName?: string;
  } | null>(null);

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

  const executeDownload = async (
    inst: any,
    targetVersion: any,
    depsToInstall: string[] = [],
  ) => {
    if (!item) return;
    const folderName = inst.folderName || inst.id || inst.name;
    setInstallingId(folderName);

    try {
      const res = await (window as any).modrinthAPI?.installWithDependencies?.({
        mainProject: { id: item.id, type: item.type, version: targetVersion },
        dependencyProjectIds: depsToInstall,
        instanceFolderName: folderName,
        minecraftVersion: inst.minecraftVersion,
        modloader: inst.modloader,
      });

      if (res?.success) {
        showAlert(
          `Successfully installed "${item.name}" to ${inst.name}!`,
          "success",
        );
        setTimeout(() => onClose(), 1500);
      }
    } catch (err: any) {
      showAlert("Failed to install to this instance", "error");
    } finally {
      setInstallingId(null);
      setPendingInstall(null);
    }
  };

  const handleSelectInstance = async (inst: any) => {
    if (!item || installingId) return;

    const folderName = inst.folderName || inst.id || inst.name;
    setInstallingId(folderName);

    try {
      const check = await (window as any).modrinthAPI?.checkEligibility?.({
        projectId: item.id,
        projectType: item.type,
        instanceFolderName: folderName,
        minecraftVersion: inst.minecraftVersion,
        modloader: inst.modloader,
      });

      setPendingInstall({
        instance: inst,
        version: check.version,
        missingDependencies: check.missingDependencies || [],
        existingFileName: check.existingFileName,
      });

      // 2. Если это дубликат — открываем модалку подтверждения
      if (check.isDuplicate) {
        setShowDuplicateModal(true);
        return;
      }

      // 3. Если есть зависимости — открываем модалку зависимостей
      if (check.missingDependencies && check.missingDependencies.length > 0) {
        setShowDepsModal(true);
        return;
      }

      // 4. Если всё чисто — качаем сразу
      await executeDownload(inst, check.version, []);
    } catch (err: any) {
      showAlert("Compatibility check failed", "error");
    } finally {
      setInstallingId(null);
    }
  };

  const handleConfirmDuplicate = async () => {
    if (!pendingInstall) return;
    setShowDuplicateModal(false);

    // После дубликата проверяем, есть ли зависимости
    if (pendingInstall.missingDependencies.length > 0) {
      setShowDepsModal(true);
    } else {
      await executeDownload(
        pendingInstall.instance,
        pendingInstall.version,
        [],
      );
    }
  };

  // Выбор установки с зависимостями или без
  const handleConfirmDependencies = async (withDeps: boolean) => {
    if (!pendingInstall) return;
    setShowDepsModal(false);

    const depIds = withDeps
      ? pendingInstall.missingDependencies.map((d: any) => d.id)
      : [];

    await executeDownload(
      pendingInstall.instance,
      pendingInstall.version,
      depIds,
    );
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
      <ConfirmModal
        isOpen={showDuplicateModal}
        onClose={() => {
          setShowDuplicateModal(false);
          setPendingInstall(null);
        }}
        onConfirm={handleConfirmDuplicate}
        title="Duplicate File"
        warningText={`"${item?.name}" is already installed in this instance (${pendingInstall?.existingFileName}). Do you really want to download and overwrite it?`}
        yesText="Cancel"
        noText="Download anyway"
        isDangerous={false}
      />

      {/* Модалка отсутствующих зависимостей */}
      <DependenciesModal
        isOpen={showDepsModal}
        onClose={() => {
          setShowDepsModal(false);
          setPendingInstall(null);
        }}
        mainItemName={item?.name ?? "Mod"}
        dependencies={pendingInstall?.missingDependencies ?? []}
        onConfirmInstall={handleConfirmDependencies}
      />
    </CustomModal>
  );
}
