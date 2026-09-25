// src/components/InstallationModal.tsx
import CustomModal from "./CustomModal";
import { useState, useEffect, useRef } from "react";
import { Instance } from "./types";
import ConfirmModal from "./ConfirmModal";
import { useAlert } from "./contexts/alertContext";
import { Loader2, HardDrive, Wifi } from "lucide-react";

type Props = {
  isOpen: boolean;
  instance: Instance | null;
  onClose: () => void;
  onSuccess?: () => void;
};

export default function InstallationModal({ isOpen, instance, onClose, onSuccess }: Props) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [statusText, setStatusText] = useState("Preparing for installation...");
  const [progress, setProgress] = useState(0);
  const [downloadedBytes, setDownloadedBytes] = useState(0);
  const [totalBytes, setTotalBytes] = useState(0);
  const [speedMbits, setSpeedMbits] = useState(0);

  const { showAlert } = useAlert();
  const lastBytesRef = useRef(0);
  const lastTimeRef = useRef(Date.now());
  const downloadedBytesRef = useRef(0);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 MB";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  useEffect(() => {
    downloadedBytesRef.current = downloadedBytes;
  }, [downloadedBytes]);

  // Расчет скорости (Mbit/s)
  useEffect(() => {
    if (!isOpen) return;

    lastBytesRef.current = downloadedBytesRef.current;
    lastTimeRef.current = Date.now();

    const interval = setInterval(() => {
      const now = Date.now();
      const timeDelta = (now - lastTimeRef.current) / 1000;
      const currentBytes = downloadedBytesRef.current;

      if (timeDelta > 0) {
        const bytesDelta = currentBytes - lastBytesRef.current;
        const mbits = (bytesDelta * 8) / (1024 * 1024) / timeDelta;
        setSpeedMbits(Math.max(0, parseFloat(mbits.toFixed(1))));
        lastBytesRef.current = currentBytes;
        lastTimeRef.current = now;
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Подписка на IPC события
  useEffect(() => {
    if (!isOpen || !instance) return;

    const instanceId = instance.id || instance.name;

    const unsubProgress = (window as any).instanceAPI.onProgress((data: any) => {
      if (data.instanceId === instanceId) {
        if (data.statusText) setStatusText(data.statusText);
        if (data.progress !== undefined) setProgress(data.progress);
        if (data.downloadedBytes !== undefined) setDownloadedBytes(data.downloadedBytes);
        if (data.totalBytes !== undefined) setTotalBytes(data.totalBytes);
      }
    });

    const unsubComplete = (window as any).instanceAPI.onComplete((data: any) => {
      if (data.instanceId === instanceId) {
        showAlert("Installation complete!", "default");
        onSuccess?.();
        onClose();
      }
    });

    const unsubError = (window as any).instanceAPI.onError((data: any) => {
      if (data.instanceId === instanceId) {
        showAlert(`Installation error: ${data.error}`, "default");
        onClose();
      }
    });

    // Запуск процесса установки
    (window as any).instanceAPI.install(instanceId).catch((err: any) => {
      console.error("Installation failure:", err);
    });

    return () => {
      unsubProgress();
      unsubComplete();
      unsubError();
    };
  }, [isOpen, instance]);

  const handleConfirmCancel = async () => {
    if (instance) {
      const folderName = instance.id || instance.name;
      try {
        await (window as any).instanceAPI.cancelInstall(folderName);
        await (window as any).folderAPI.deleteInstanceFolder(folderName, "soft");
      } catch (error) {
        console.error("Failed to cancel installation:", error);
      }
    }
    setShowConfirmModal(false);
    onClose();
    showAlert("Installation cancelled", "default");
  };

  if (!instance) return null;

  return (
    <>
      <CustomModal
        isOpen={isOpen}
        onClose={() => setShowConfirmModal(true)}
        title={`Installing ${instance.name} (${instance.minecraftVersion})`}
        size="large"
        closeOnEsc={false}
        closeOnOutsideClick={false}
      >
        <div className="flex flex-col gap-6 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Loader2 className="animate-spin text-blue-400" size={18} />
              <span className="text-[14px] font-medium text-gray-200 truncate max-w-[380px]">
                {statusText}
              </span>
            </div>
            <span className="text-[14px] font-bold text-blue-400">{progress}%</span>
          </div>

          <div className="relative h-3 w-full overflow-hidden rounded-full bg-white/5 border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3">
              <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
                <HardDrive size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                  Loaded
                </span>
                <span className="text-[13px] font-semibold text-gray-200">
                  {formatBytes(downloadedBytes)} / {formatBytes(totalBytes)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3">
              <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
                <Wifi size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                  Speed
                </span>
                <span className="text-[13px] font-semibold text-gray-200">
                  {speedMbits} Mbit/s
                </span>
              </div>
            </div>
          </div>
        </div>
      </CustomModal>

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmCancel}
        warningText="Are you sure you want to cancel the instance installation? If you cancel now, downloaded files for this session will be cleaned up and you will have to download everything again later."
        yesText="No, continue"
        noText="Yes, cancel"
        title="Cancel installation?"
      />
    </>
  );
}