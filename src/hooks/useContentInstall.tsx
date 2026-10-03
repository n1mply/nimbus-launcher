import { useState, type ReactNode } from "react";
import AddToInstanceModal from "../AddToInstanceModal";
import InstallationModal from "../InstallationModal";
import { useAlert } from "../contexts/alertContext";
import type { ContentItem } from "../types";


export function useContentInstall(): {
  install: (item: ContentItem) => Promise<void>;
  modals: ReactNode;
} {
  const { showAlert } = useAlert();

  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [installingModpackInstance, setInstallingModpackInstance] = useState<any | null>(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);

  const install = async (item: ContentItem) => {
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

    setSelectedItem(item);
    setShowModal(true);
  };

  const modals = (
    <>
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
          showAlert(`"${installingModpackInstance?.name}" installed successfully!`, "default");
        }}
      />
    </>
  );

  return { install, modals };
}