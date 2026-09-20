import { useState, useEffect, useRef } from "react";
import { useAlert } from "./contexts/alertContext";
import { Instance } from "./types";
import { Play, Download, Loader2 } from "lucide-react";
import GameBarMarquee from "./GameBarMarquee";
import { MorphIcon } from "morphicons/react";
import type { Status } from "./types";


import {
  Folder,
  FolderOpen,
  X,
  ChevronDown,
  SlidersHorizontal,
  Settings,
} from "lucide";

import InstallationModal from "./InstallationModal";

type AbsoluteGameBarProps = {
  instance: Instance | null;
  status: Status;
  setStatus: () => void;
  onClose: () => void;
  onPlay?: (instance: Instance) => void;
  onInstall?: (instance: Instance) => void;
  onOpenFolder?: (instance: Instance) => void;
  onOpenSettings?: (instance: Instance) => void;
};

// Добавлено состояние "launching" для индикации запуска процесса
type Phase = "hidden" | "entering" | "visible" | "exiting";

const ANIMATION_DURATION = 300;

export default function AbsoluteGameBar({
  instance,
  status,
  setStatus,
  onClose,
  onPlay,
  onOpenFolder,
  onOpenSettings,
}: AbsoluteGameBarProps) {
  const [displayedInstance, setDisplayedInstance] = useState<Instance | null>(
    instance,
  );
  const { showAlert } = useAlert();
  const [phase, setPhase] = useState<Phase>(instance ? "visible" : "hidden");

  const [showModal, setShowModal] = useState(false);

  const pendingInstanceRef = useRef<Instance | null>(null);
  const requestIdRef = useRef(0);
  const fallbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitHandledRef = useRef(false);

  const [isHoveredFolder, setIsHoveredFolder] = useState(false);
  const [isHoveredSettings, setIsHoveredSettings] = useState(false);
  const [isHoveredClose, setIsHoveredClose] = useState(false);

  // Открытие папки игры
  const handleOpenFolder = async () => {
    if (!displayedInstance) return;
    const folderName = (displayedInstance as any).id || displayedInstance.name;
    try {
      const res = await window.folderAPI.openInstanceFolder(folderName);
      if (res && !res.success) {
        showAlert(`Error openeing folder: ${res.error}`, "error");
      }
    } catch (err: any) {
      console.error(err);
      showAlert(`Can not open the instance folder: ${err.message}`, "error");
    }
  };

  // Проверка, установлена ли сборка на диске
  const runInstalledCheck = (target: Instance) => {
    setStatus("loading");
    const instanceId = (target as any).id || target.name;
    const requestId = ++requestIdRef.current;

    window.instancesAPI
      .checkInstalled(instanceId)
      .then((isInstalled: boolean) => {
        if (requestId !== requestIdRef.current) return;
        setStatus(isInstalled ? "installed" : "not_installed");
      })
      .catch(() => {
        if (requestId !== requestIdRef.current) return;
        setStatus("error");
      });
  };

  const openInstance = (target: Instance) => {
    setDisplayedInstance(target);
    runInstalledCheck(target);
    setPhase("entering");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setPhase("visible"));
    });
  };

  const finishExit = () => {
    if (exitHandledRef.current) return;
    exitHandledRef.current = true;

    if (fallbackTimeoutRef.current) {
      clearTimeout(fallbackTimeoutRef.current);
      fallbackTimeoutRef.current = null;
    }

    setPhase("hidden");
    setDisplayedInstance(null);

    if (pendingInstanceRef.current) {
      const next = pendingInstanceRef.current;
      pendingInstanceRef.current = null;
      openInstance(next);
    }
  };

  useEffect(() => {
    if (instance) {
      if (phase === "exiting") {
        pendingInstanceRef.current = instance;
        return;
      }

      if (phase === "visible" || phase === "entering") {
        setDisplayedInstance(instance);
        runInstalledCheck(instance);
        return;
      }

      exitHandledRef.current = false;
      openInstance(instance);
      return;
    }

    if (phase === "visible" || phase === "entering") {
      pendingInstanceRef.current = null;
      exitHandledRef.current = false;
      setPhase("exiting");

      if (fallbackTimeoutRef.current) clearTimeout(fallbackTimeoutRef.current);
      fallbackTimeoutRef.current = setTimeout(
        finishExit,
        ANIMATION_DURATION + 50,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instance]);

  // Слушатели событий завершения/краша игры
  useEffect(() => {
    const unsubClosed = window.instancesAPI.onGameClosed?.((data: any) => {
      const currentId =
        (displayedInstance as any)?.id || displayedInstance?.name;
      if (data.instanceId === currentId) {
        setStatus("installed");
        showAlert("Game was closed", "default");
      }
    });

    const unsubCrashed = window.instancesAPI.onGameCrashed?.((data: any) => {
      const currentId =
        (displayedInstance as any)?.id || displayedInstance?.name;
      if (data.instanceId === currentId) {
        setStatus("installed");
        showAlert(
          `Game was crushed with error (code ${data.exitCode})`,
          "error",
        );
      }
    });

    return () => {
      unsubClosed?.();
      unsubCrashed?.();
    };
  }, [displayedInstance]);

  useEffect(() => {
    return () => {
      if (fallbackTimeoutRef.current) clearTimeout(fallbackTimeoutRef.current);
    };
  }, []);

  if (phase === "hidden" || !displayedInstance) return null;

  const isVisible = phase === "visible";

  // Обработчик кнопки Play / Install
  async function handlePrimaryAction() {
    if (status === "not_installed") {
      setShowModal(true);
      return;
    }

    if (status === "installed") {
      const instanceId =
        (displayedInstance as any).id || displayedInstance.name;
      setStatus("launching");

      try {
        onPlay?.(displayedInstance);
        await window.instancesAPI.launch(instanceId);
        // Не возвращаем статус назад сразу — игра запускается
      } catch (err: any) {
        console.error("Ошибка запуска:", err);
        showAlert(`Launching error: ${err.message}`, "error");
        setStatus("installed");
      }
    }
  }

  // Вызывается при успешном завершении установки в модалке
  const handleInstallationSuccess = () => {
    setStatus("installed");
    setShowModal(false);
  };

  return (
    <div
      onTransitionEnd={(e) => {
        if (e.target !== e.currentTarget) return;
        if (phase === "exiting") {
          finishExit();
        }
      }}
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isVisible
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-8 scale-95 pointer-events-none"
      }`}
    >
      <div className="relative">
        <GameBarMarquee instance={displayedInstance} />

        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#1A1C23]/90 px-3 py-2 shadow-2xl backdrop-blur-md">
          {/* Кнопка Settings */}
          <button
            type="button"
            onClick={() => onOpenSettings?.(displayedInstance)}
            onMouseEnter={() => setIsHoveredSettings(true)}
            onMouseLeave={() => setIsHoveredSettings(false)}
            className="backface-visibility-hidden will-change-transform flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium text-gray-300 transition-colors hover:bg-white/5 hover:text-white cursor-pointer active:scale-95"
          >
            <MorphIcon
              icon={isHoveredSettings ? Settings : SlidersHorizontal}
              size={16}
              spring="snappy"
            />
            <span>Settings</span>
          </button>

          {/* Главная кнопка: Play / Install / Launching */}
          <button
            type="button"
            disabled={
              status === "loading" ||
              status === "launching" ||
              status === "error"
            }
            onClick={handlePrimaryAction}
            className={`backface-visibility-hidden will-change-transform flex w-36 items-center justify-center gap-2 rounded-full py-2.5 text-[14px] font-semibold transition-colors duration-150 cursor-pointer active:scale-95 ${
              status === "installed"
                ? "border border-blue-400/30 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-500/10"
                : status === "not_installed"
                  ? "border border-blue-400/30 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 hover:border-blue-400/50"
                  : status === "launching"
                    ? "border border-amber-400/30 bg-amber-500/20 text-amber-300 cursor-wait"
                    : "border border-white/5 bg-white/5 text-gray-500 cursor-not-allowed opacity-60"
            }`}
          >
            {(status === "loading" || status === "launching") && (
              <Loader2 size={18} className="animate-spin text-current" />
            )}

            {status === "installed" && (
              <Play size={18} className="fill-current" />
            )}

            {status === "not_installed" && <Download size={18} />}

            <span>
              {status === "loading" && "Checking..."}
              {status === "installed" && "Play"}
              {status === "launching" && "Launching..."}
              {status === "not_installed" && "Install"}
              {status === "error" && "Unavailable"}
            </span>
          </button>

          {/* Кнопка Folder */}
          <button
            type="button"
            onClick={handleOpenFolder}
            onMouseEnter={() => setIsHoveredFolder(true)}
            onMouseLeave={() => setIsHoveredFolder(false)}
            className="backface-visibility-hidden will-change-transform flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium text-gray-300 transition-colors hover:bg-white/5 hover:text-white cursor-pointer active:scale-95"
          >
            <MorphIcon
              icon={isHoveredFolder ? FolderOpen : Folder}
              size={16}
              spring="snappy"
            />
            <span>Folder</span>
          </button>

          <div className="h-4 w-px bg-white/10 mx-1" />

          {/* Кнопка Закрыть панель */}
          <button
            type="button"
            onClick={onClose}
            onMouseEnter={() => setIsHoveredClose(true)}
            onMouseLeave={() => setIsHoveredClose(false)}
            aria-label="Hide panel"
            className="backface-visibility-hidden will-change-transform flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-white/10 hover:text-white cursor-pointer active:scale-95"
          >
            <MorphIcon
              icon={isHoveredClose ? X : ChevronDown}
              size={18}
              spring="snappy"
            />
          </button>
        </div>
      </div>
      <InstallationModal
        isOpen={showModal}
        instance={displayedInstance}
        onClose={() => setShowModal(false)}
        onSuccess={handleInstallationSuccess}
      />
    </div>
  );
}
