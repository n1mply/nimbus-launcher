import CustomModal from "./CustomModal";
import { useState, useEffect, useRef } from "react";
import { Instance } from "./types";
import ConfirmModal from "./ConfirmModal";
import { useAlert } from "./contexts/alertContext";
import { Loader2, Download, HardDrive, Wifi } from "lucide-react";

type Props = {
  isOpen: boolean;
  instance: Instance | null;
  onClose: () => void;
};

export default function InstallationModal({
  isOpen,
  instance,
  onClose,
}: Props) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [statusText, setStatusText] = useState("Preparing installation...");
  const [progress, setProgress] = useState(0);
  const [downloadedBytes, setDownloadedBytes] = useState(0);
  const [totalBytes, setTotalBytes] = useState(0);
  const [speedMbits, setSpeedMbits] = useState(0);

  const { showAlert } = useAlert();
  const lastBytesRef = useRef(0);
  const lastTimeRef = useRef(Date.now());
  const isInstallingRef = useRef(false);
  const downloadedBytesRef = useRef(0);

  // Форматирование мегабайт
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 MB";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  // Расчет скорости интернета каждые 500мс
  useEffect(() => {
    downloadedBytesRef.current = downloadedBytes;
  }, [downloadedBytes]);

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
        const bitsDelta = bytesDelta * 8;
        const mbits = bitsDelta / (1024 * 1024) / timeDelta;

        setSpeedMbits(Math.max(0, parseFloat(mbits.toFixed(1))));
        lastBytesRef.current = currentBytes;
        lastTimeRef.current = now;
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isOpen]);

  const handleAttemptClose = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmCancel = async () => {
    if (instance) {
      const folderName = (instance as any).id || instance.name;
      try {
        await window.folderAPI.deleteInstanceFolder(folderName, "soft");
      } catch (error) {
        console.error("Failed to soft-delete instance folder:", error);
      }
    }

    setShowConfirmModal(false);
    onClose();
    showAlert("Installation cancelled", "default");
  };

  if (!instance) return null;

  const modloaderInfo =
    instance.modloader && instance.modloader !== "vanilla"
      ? ` (${instance.modloader.toUpperCase()} ${instance.modloaderVersion})`
      : "";

  return (
    <>
      <CustomModal
        isOpen={isOpen}
        onClose={handleAttemptClose}
        title={`Installing ${instance.name} ${instance.minecraftVersion}${modloaderInfo}`}
        size="large"
        closeOnEsc={false}
        closeOnOutsideClick={false}
        isFlexible={false}
      >
        <div className="flex flex-col gap-6 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Loader2 className="animate-spin text-blue-400" size={18} />
              <span className="text-[14px] font-medium text-gray-200 truncate max-w-[380px]">
                {statusText}
              </span>
            </div>
            <span className="text-[14px] font-bold text-blue-400">
              {progress}%
            </span>
          </div>

          <div className="relative h-3 w-full overflow-hidden rounded-full bg-white/5 border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* Скачанный объём */}
            <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3">
              <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
                <HardDrive size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                  Downloaded
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
      />
    </>
  );
}
