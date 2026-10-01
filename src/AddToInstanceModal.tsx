import { useEffect, useState } from "react";
import CustomModal from "./CustomModal";
import InstanceTile from "./InstanceTile";
import WorldTile from "./WorldTile";
import ConfirmModal from "./ConfirmModal";
import DependenciesModal from "./DependenciesModal";
import type { ContentItem, World } from "./types";
import { Loader2, ArrowLeft } from "lucide-react";
import { useAlert } from "./contexts/alertContext";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  item: ContentItem | null;
};

export default function AddToInstanceModal({ isOpen, onClose, item }: Props) {
  const isDatapack = item?.type === "datapack";

  const [step, setStep] = useState<"instance" | "world">("instance");
  const [selectedInstance, setSelectedInstance] = useState<any | null>(null);

  const [instances, setInstances] = useState<any[]>([]);
  const [worlds, setWorlds] = useState<World[]>([]);

  const [isLoadingInstances, setIsLoadingInstances] = useState(false);
  const [isLoadingWorlds, setIsLoadingWorlds] = useState(false);
  const [installingId, setInstallingId] = useState<string | null>(null);

  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [showDepsModal, setShowDepsModal] = useState(false);

  const { showAlert } = useAlert();

  const [pendingInstall, setPendingInstall] = useState<{
    instance: any;
    version: any;
    missingDependencies: any[];
    existingFileName?: string;
    world?: World;
  } | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setStep("instance");
      setSelectedInstance(null);
      setInstallingId(null);
      setPendingInstall(null);
      setShowDuplicateModal(false);
      setShowDepsModal(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setIsLoadingInstances(true);
      try {
        const list = await (window as any).instancesAPI?.getAll?.();
        if (!cancelled && Array.isArray(list)) {
          setInstances(list);
        }
      } catch (err) {
        console.error("Failed to load instances:", err);
        showAlert("Failed to load instances", "error");
      } finally {
        if (!cancelled) setIsLoadingInstances(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, showAlert]);

  const loadWorldsForInstance = async (inst: any) => {
    setSelectedInstance(inst);
    setStep("world");
    setIsLoadingWorlds(true);

    try {
      const fName = inst.folderName || inst.id || inst.name;
      const list = await (window as any).worldsAPI?.getByInstance?.(fName);
      setWorlds(Array.isArray(list) ? list : []);
    } catch (err: any) {
      console.error("Failed to load worlds:", err);
      showAlert("Failed to load worlds for this instance", "error");
      setWorlds([]);
    } finally {
      setIsLoadingWorlds(false);
    }
  };

  const executeDownload = async (
    inst: any,
    targetVersion: any,
    depsToInstall: string[] = [],
    world?: World,
  ) => {
    if (!item) return;
    const folderName = inst.folderName || inst.id || inst.name;
    const targetKey = world ? `${folderName}-${world.folderName}` : folderName;
    setInstallingId(targetKey);

    try {
      const res = await (window as any).modrinthAPI?.installWithDependencies?.({
        mainProject: { id: item.id, type: item.type, version: targetVersion },
        dependencyProjectIds: depsToInstall,
        instanceFolderName: folderName,
        minecraftVersion: inst.minecraftVersion,
        modloader: inst.modloader,
        worldFolderName: world?.folderName,
      });

      if (res?.success) {
        showAlert(
          world
            ? `Successfully installed "${item.name}" to world "${world.name}"!`
            : `Successfully installed "${item.name}" to ${inst.name}!`,
          "success",
        );
        setTimeout(() => onClose(), 1500);
      }
    } catch (err: any) {
      showAlert(err.message || "Failed to install to this instance", "error");
    } finally {
      setInstallingId(null);
      setPendingInstall(null);
    }
  };

  const handleSelectWorld = async (w: World) => {
    if (!item || !selectedInstance || installingId) return;

    const folderName = selectedInstance.folderName || selectedInstance.id || selectedInstance.name;
    setInstallingId(`${folderName}-${w.folderName}`);

    try {
      const check = await (window as any).modrinthAPI?.checkEligibility?.({
        projectId: item.id,
        projectType: item.type,
        instanceFolderName: folderName,
        minecraftVersion: selectedInstance.minecraftVersion,
        modloader: selectedInstance.modloader,
        worldFolderName: w.folderName,
      });

      setPendingInstall({
        instance: selectedInstance,
        version: check.version,
        missingDependencies: [],
        existingFileName: check.existingFileName,
        world: w,
      });

      if (check.isDuplicate) {
        setShowDuplicateModal(true);
        return;
      }

      await executeDownload(selectedInstance, check.version, [], w);
    } catch (err: any) {
      showAlert(err.message || "Compatibility check failed", "error");
    } finally {
      setInstallingId(null);
    }
  };

  const handleSelectInstance = async (inst: any) => {
    if (!item || installingId) return;

    if (isDatapack) {
      await loadWorldsForInstance(inst);
      return;
    }

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

      // Дубликат файла
      if (check.isDuplicate) {
        setShowDuplicateModal(true);
        return;
      }

      // Отсутствуют зависимости
      if (check.missingDependencies && check.missingDependencies.length > 0) {
        setShowDepsModal(true);
        return;
      }

      await executeDownload(inst, check.version, []);
    } catch (err: any) {
      showAlert(err.message || "Compatibility check failed", "error");
    } finally {
      setInstallingId(null);
    }
  };

  const handleConfirmDuplicate = async () => {
    if (!pendingInstall) return;
    setShowDuplicateModal(false);

    if (pendingInstall.missingDependencies.length > 0) {
      setShowDepsModal(true);
    } else {
      await executeDownload(
        pendingInstall.instance,
        pendingInstall.version,
        [],
        pendingInstall.world,
      );
    }
  };

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
      pendingInstall.world,
    );
  };

  return (
    <>
      <CustomModal
        isOpen={isOpen && !showDuplicateModal && !showDepsModal}
        onClose={onClose}
        title={
          step === "world"
            ? `Select World (${selectedInstance?.name})`
            : isDatapack
            ? `Add Datapack "${item?.name}"`
            : `Add "${item?.name}" to Instance`
        }
        size="medium"
      >
        <div className="flex flex-col gap-4">
          {step === "world" && (
            <button
              type="button"
              onClick={() => setStep("instance")}
              className="flex items-center gap-1.5 text-[12px] font-medium text-gray-400 hover:text-white transition-colors cursor-pointer w-fit"
            >
              <ArrowLeft size={14} /> Back to instances
            </button>
          )}
          {step === "instance" &&
            (isLoadingInstances ? (
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
                  {isDatapack
                    ? "Select instance containing your world:"
                    : `Choose an instance to install this ${item?.type}:`}
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
            ))}
          {step === "world" &&
            (isLoadingWorlds ? (
              <div className="flex h-44 flex-col items-center justify-center gap-2 text-gray-500">
                <Loader2 size={24} className="animate-spin text-blue-400" />
                <span className="text-[13px]">Loading worlds...</span>
              </div>
            ) : worlds.length === 0 ? (
              <div className="flex h-44 flex-col items-center justify-center text-center text-gray-500 p-4">
                <p className="text-[14px] text-gray-300">No worlds found</p>
                <p className="text-[12px] text-gray-500 mt-1">
                  Launch "{selectedInstance?.name}" and create a world first.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-[420px] overflow-y-auto custom-scrollbar pr-1">
                <p className="text-[12px] text-gray-400 mb-1">
                  Select the world to install this datapack:
                </p>
                {worlds.map((w) => {
                  const fName = selectedInstance?.folderName || selectedInstance?.name;
                  const targetKey = `${fName}-${w.folderName}`;
                  return (
                    <WorldTile
                      key={w.folderName}
                      world={w}
                      isLoading={installingId === targetKey}
                      disabled={installingId !== null}
                      onClick={() => handleSelectWorld(w)}
                    />
                  );
                })}
              </div>
            ))}
        </div>
      </CustomModal>
      <ConfirmModal
        isOpen={showDuplicateModal}
        onClose={() => {
          setShowDuplicateModal(false);
          setPendingInstall(null);
        }}
        onConfirm={handleConfirmDuplicate}
        title="Duplicate File"
        warningText={
          pendingInstall?.world
            ? `"${item?.name}" is already installed in world "${pendingInstall.world.name}". Do you really want to download and overwrite it?`
            : `"${item?.name}" is already installed in this instance (${pendingInstall?.existingFileName}). Do you really want to download and overwrite it?`
        }
        yesText="Cancel"
        noText="Download anyway"
        isDangerous={false}
      />
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
    </>
  );
}