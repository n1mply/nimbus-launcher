/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Upload,
  RefreshCw,
  Palette,
  Trash2,
  Loader2,
  CheckCircle2,
  XCircle,
  FolderOpen,
  Cpu,
  ShieldCheck,
  FileText,
} from "lucide-react";

import CustomModal from "./CustomModal";
import ConfirmModal from "./ConfirmModal";
import { Instance, ModloaderType } from "./types";
import CustomInput, { CustomInputOption } from "./CustomInput";
import { useAlert } from "./contexts/alertContext";

type JavaCheck =
  | { state: "idle" }
  | { state: "checking" }
  | { state: "ok"; version: string }
  | { state: "error"; message: string };

type Props = {
  isOpen?: boolean;
  onClose?: () => void;
  instance?: Instance | null;
  totalMemMb?: number;
  isBusy?: boolean;
  loaderVersions?: string[];
  loaderVersionsLoading?: boolean;
  onUpdated?: (updatedInstance: Instance) => void;
  onDeleted?: (instanceId: string) => void;
};

const RAM_STEP = 256;
const RAM_FLOOR = 512;
const DEFAULT_MIN_MB = 512;
const DEFAULT_MAX_MB = 3072;

const inputCls =
  "w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-[13px] text-white placeholder:text-gray-500 outline-none transition-colors focus:border-blue-400/30 disabled:opacity-50";

const secondaryBtnCls =
  "flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-[13px] text-gray-300 transition-colors hover:bg-white/[0.06] hover:text-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-50";

const accentBtnCls =
  "flex items-center gap-2 rounded-lg border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-[13px] font-medium text-blue-300 transition-colors hover:bg-blue-500/15 hover:border-blue-400/30 cursor-pointer active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-blue-500/10";

const dangerBtnCls =
  "flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-[13px] font-medium text-red-300 transition-colors hover:bg-red-500/20 hover:border-red-500/30 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-red-500/10";

const fmtMem = (mb: number) =>
  mb >= 1024 ? `${+(mb / 1024).toFixed(2)} GB` : `${mb} MB`;

/* ───────────────────────── Хелпер IPC вызовов ───────────────────────── */
async function invokeIPC<T = any>(channel: string, ...args: any[]): Promise<T> {
  const electron = (window as any).electron || (window as any).ipcRenderer;
  if (electron?.ipcRenderer?.invoke) {
    return electron.ipcRenderer.invoke(channel, ...args);
  }
  if ((window as any).ipcRenderer?.invoke) {
    return (window as any).ipcRenderer.invoke(channel, ...args);
  }
  // Поддержка прямых мостов instancesAPI/folderAPI, если они прописаны в preload
  const [domain, method] = channel.split(":");
  if (domain === "folder" && (window as any).folderAPI?.[method]) {
    return (window as any).folderAPI[method](...args);
  }
  if (domain === "instances" && (window as any).instancesAPI?.[method]) {
    return (window as any).instancesAPI[method](...args);
  }
  throw new Error(`IPC bridge is not found for channel: ${channel}`);
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-medium text-gray-300">{label}</label>
      {children}
      {hint && (
        <p className="text-[12px] leading-relaxed text-gray-500">{hint}</p>
      )}
    </div>
  );
}

function Section({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 pb-5 border-b border-white/5 last:border-b-0 last:pb-0">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-300">
          {icon}
        </div>
        <div className="flex flex-col">
          <h3 className="text-[13px] font-semibold text-white">{title}</h3>
          {description && (
            <p className="text-[12px] leading-relaxed text-gray-500">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}

function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-white/5 bg-white/[0.03] p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`rounded-md px-3 py-1.5 text-[13px] transition-colors cursor-pointer ${
            value === o.value
              ? "bg-blue-500/15 text-blue-300"
              : "text-gray-400 hover:text-white"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function RamRange({
  min,
  max,
  low,
  high,
  step,
  onChange,
}: {
  min: number;
  max: number;
  low: number;
  high: number;
  step: number;
  onChange: (low: number, high: number) => void;
}) {
  const span = Math.max(max - min, 1);
  const pct = (v: number) => ((v - min) / span) * 100;

  const thumbCls =
    "pointer-events-none absolute inset-0 h-full w-full appearance-none bg-transparent " +
    "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 " +
    "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full " +
    "[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-300 " +
    "[&::-webkit-slider-thumb]:bg-[#14151C] [&::-webkit-slider-thumb]:cursor-pointer";

  const lowOnTop = low > min + span / 2;

  return (
    <div className="relative h-5">
      <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-white/10" />
      <div
        className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-blue-400/60"
        style={{ left: `${pct(low)}%`, width: `${pct(high) - pct(low)}%` }}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={low}
        aria-label="Minimum memory"
        onChange={(e) => onChange(Math.min(Number(e.target.value), high), high)}
        className={`${thumbCls} ${lowOnTop ? "z-30" : "z-10"}`}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={high}
        aria-label="Maximum memory"
        onChange={(e) => onChange(low, Math.max(Number(e.target.value), low))}
        className={`${thumbCls} ${lowOnTop ? "z-10" : "z-30"}`}
      />
    </div>
  );
}

export default function InstanceSettingsModal({
  isOpen = true,
  onClose,
  instance,
  totalMemMb,
  isBusy = false,
  loaderVersions,
  loaderVersionsLoading = false,
  onUpdated,
  onDeleted,
}: Props) {
  if (!instance) return null;

  const [detectedTotalMemMb, setDetectedTotalMemMb] = useState<number>(
    totalMemMb || 16384,
  );
  const { showAlert } = useAlert();

  useEffect(() => {
    if (!totalMemMb) {
      invokeIPC<number>("system:getTotalMemoryMb")
        .then((mb) => {
          if (mb && Number.isFinite(mb)) setDetectedTotalMemMb(mb);
        })
        .catch(() => {});
    }
  }, [totalMemMb]);

  const safeTotalMb =
    Number.isFinite(detectedTotalMemMb) && detectedTotalMemMb > 0
      ? detectedTotalMemMb
      : 8192;
  const ramMax = Math.max(
    Math.floor(safeTotalMb / RAM_STEP) * RAM_STEP,
    RAM_FLOOR,
  );

  const isVanilla = instance.modloader === "vanilla";

  // Загрузчик версий (если не переданы в props, подтягиваем при необходимости)
  const [internalVersions, setInternalVersions] = useState<string[]>(
    loaderVersions ?? [],
  );
  const [internalVersionsLoading, setInternalVersionsLoading] = useState(
    loaderVersionsLoading,
  );

  useEffect(() => {
    if (loaderVersions) {
      setInternalVersions(loaderVersions);
      return;
    }
    if (!isVanilla && isOpen) {
      setInternalVersionsLoading(true);
      invokeIPC<string[]>(
        "versions:getLoaderVersions",
        instance.modloader,
        instance.minecraftVersion,
      )
        .then((res) => {
          if (Array.isArray(res)) setInternalVersions(res);
        })
        .catch(() => {})
        .finally(() => setInternalVersionsLoading(false));
    }
  }, [
    instance.modloader,
    instance.minecraftVersion,
    isVanilla,
    loaderVersions,
    isOpen,
  ]);

  const initial = useMemo(() => {
    const s = instance.launchSettings;
    return {
      name: instance.name ?? "",
      minMb: s?.memory?.minMb ?? DEFAULT_MIN_MB,
      maxMb: Math.min(s?.memory?.maxMb ?? DEFAULT_MAX_MB, ramMax),
      javaMode: (s?.java?.mode ?? "auto") as "auto" | "custom",
      javaPath: s?.java?.path ?? "",
      jvmArgs: s?.jvmArgs ?? "",
    };
  }, [instance, ramMax]);

  const [name, setName] = useState(initial.name);
  const [iconPreview, setIconPreview] = useState<string | null>(
    instance.instanceIconPath ?? null,
  );
  const [iconDiskPath, setIconDiskPath] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loaderSel, setLoaderSel] = useState(instance.modloaderVersion || "");
  const [applyingLoader, setApplyingLoader] = useState(false);

  const [minMb, setMinMb] = useState(initial.minMb);
  const [maxMb, setMaxMb] = useState(initial.maxMb);
  const [javaMode, setJavaMode] = useState<"auto" | "custom">(initial.javaMode);
  const [javaPath, setJavaPath] = useState(initial.javaPath);
  const [javaCheck, setJavaCheck] = useState<JavaCheck>({ state: "idle" });
  const [jvmArgs, setJvmArgs] = useState(initial.jvmArgs);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [verifying, setVerifying] = useState(false);
  const [verifyStatusText, setVerifyStatusText] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifyDone, setVerifyDone] = useState(false);
  const verifyDoneTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const [logError, setLogError] = useState<string | null>(null);

  const handleOpenLatestLog = async () => {
    setLogError(null);
    try {
      const res = await invokeIPC<{ success: boolean; error?: string }>(
        "folder:openLatestLog",
        instance.id, // id === имя папки
      );
      if (!res.success) setLogError(res.error || "Failed to open the log file");
    } catch (e: any) {
      setLogError(e.message || "Failed to open the log file");
    }
  };

  const flashVerifyDone = () => {
    if (verifyDoneTimeoutRef.current)
      clearTimeout(verifyDoneTimeoutRef.current);
    setVerifyDone(true);
    verifyDoneTimeoutRef.current = setTimeout(() => {
      setVerifyDone(false);
      verifyDoneTimeoutRef.current = null;
    }, 3000);
  };

  const trackInstall = (
    onStatus: (text: string) => void,
    onDone: (ok: boolean, err?: string) => void,
  ) => {
    const api = (window as any).instancesAPI;
    const offProgress = api?.onProgress?.((d: any) => {
      if (d.instanceId === instance.id) onStatus(d.statusText || "");
    });
    const offComplete = api?.onComplete?.((d: any) => {
      if (d.instanceId === instance.id) {
        cleanup();
        onDone(true);
      }
    });
    const offError = api?.onError?.((d: any) => {
      if (d.instanceId === instance.id) {
        cleanup();
        onDone(false, d.error);
      }
    });
    const cleanup = () => {
      offProgress?.();
      offComplete?.();
      offError?.();
    };
    return cleanup;
  };

  useEffect(() => {
    if (!isOpen) return;
    setName(initial.name);
    setIconPreview(instance.instanceIconPath ?? null);
    setIconDiskPath(null);
    setLoaderSel(instance.modloaderVersion || "");
    setMinMb(initial.minMb);
    setMaxMb(initial.maxMb);
    setJavaMode(initial.javaMode);
    setJavaPath(initial.javaPath);
    setJavaCheck({ state: "idle" });
    setJvmArgs(initial.jvmArgs);
    setSaveError(null);
    if (verifyDoneTimeoutRef.current) {
      clearTimeout(verifyDoneTimeoutRef.current);
      verifyDoneTimeoutRef.current = null;
    }
    setVerifying(false);
    setVerifyStatusText(null);
    setVerifyError(null);
    setVerifyDone(false);
    setLogError(null)
  }, [isOpen, instance.id, initial]);

  useEffect(
    () => () => {
      if (verifyDoneTimeoutRef.current)
        clearTimeout(verifyDoneTimeoutRef.current);
    },
    [],
  );

  useEffect(
    () => () => {
      if (iconPreview?.startsWith("blob:")) URL.revokeObjectURL(iconPreview);
    },
    [iconPreview],
  );

  const handleClose = () => {
    onClose?.();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const diskPath = (file as any).path || null;
    setIconDiskPath(diskPath);
    setIconPreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const handlePickJava = async () => {
    try {
      const picked = await invokeIPC<string | null>("java:pickExecutable");
      if (picked) {
        setJavaPath(picked);
        setJavaCheck({ state: "idle" });
        runJavaCheck(picked);
      }
    } catch (e: any) {
      setJavaCheck({
        state: "error",
        message: e.message || "Error selecting Java",
      });
    }
  };

  const runJavaCheck = async (execPath: string) => {
    if (!execPath.trim()) return;
    setJavaCheck({ state: "checking" });
    try {
      const res = await invokeIPC<{
        ok: boolean;
        version?: string;
        error?: string;
      }>("java:validate", execPath.trim());
      if (res.ok) {
        setJavaCheck({ state: "ok", version: res.version || "Detected" });
      } else {
        setJavaCheck({
          state: "error",
          message: res.error || "Invalid Java executable",
        });
      }
    } catch (err: any) {
      setJavaCheck({
        state: "error",
        message: err.message || "Validation failed",
      });
    }
  };

  const handleVerifyIntegrity = async () => {
    setVerifying(true);
    setVerifyError(null);
    setVerifyDone(false);
    const cleanup = trackInstall(setVerifyStatusText, (ok, err) => {
      setVerifying(false);
      if (ok) flashVerifyDone();
      else setVerifyError(err || "Verification failed");
    });
    try {
      await invokeIPC("instance:install", instance.id);
    } catch (e: any) {
      cleanup();
      setVerifying(false);
      setVerifyError(e.message || "Verification failed");
    }
  };

  const handleApplyLoader = async () => {
    if (!loaderSel || loaderSel === instance.modloaderVersion) return;
    setApplyingLoader(true);
    setSaveError(null);
    try {
      const res = await invokeIPC<{
        success: boolean;
        data?: Instance;
        error?: string;
      }>("instances:setLoaderVersion", instance.id, loaderSel);
      if (!res.success || !res.data) {
        setSaveError(res.error || "Failed to update loader version");
        return;
      }
      onUpdated?.(res.data);

      await new Promise<void>((resolve, reject) => {
        const cleanup = trackInstall(setVerifyStatusText, (ok, err) =>
          ok ? resolve() : reject(new Error(err)),
        );
        invokeIPC("instance:install", instance.id).catch((e) => {
          cleanup();
          reject(e);
        });
      });
    } catch (e: any) {
      setSaveError(e.message || "Failed to install the new loader version");
    } finally {
      setApplyingLoader(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);

    try {
      const payload: any = {
        launchSettings: {
          memory: { minMb, maxMb },
          java:
            javaMode === "custom"
              ? { mode: "custom", path: javaPath.trim() }
              : { mode: "auto" },
          jvmArgs: jvmArgs.trim() || null,
        },
      };

      if (name.trim() !== initial.name) {
        payload.name = name.trim();
      }

      if (iconDiskPath) {
        payload.iconSourcePath = iconDiskPath;
      }

      const res = await invokeIPC<{
        success: boolean;
        data?: Instance;
        error?: string;
      }>("instances:updateSettings", instance.id, payload);

      if (res.success && res.data) {
        onUpdated?.(res.data);
        handleClose();
      } else {
        setSaveError(res.error || "Failed to save settings");
      }
      showAlert(`${instance.name}'s settings was saved!`, "default");
    } catch (err: any) {
      setSaveError(err.message || "Save error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setSaveError(null);
    try {
      const res = await invokeIPC<{ success: boolean; error?: string }>(
        "folder:deleteInstanceFolder",
        {
          folderName: instance.id,
          mode: "hard",
        },
      );
      showAlert(`${instance.name} was successfully deleted!`, "default");

      if (res.success) {
        setConfirmDelete(false);
        onDeleted?.(instance.id);
        handleClose();
      } else {
        setSaveError(res.error || "Failed to delete instance");
        setConfirmDelete(false);
      }
    } catch (err: any) {
      setSaveError(err.message || "Delete error");
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  };

  const valid =
    name.trim().length > 0 &&
    minMb <= maxMb &&
    (javaMode === "auto" ||
      (javaPath.trim().length > 0 && javaCheck.state !== "error"));

  const isDirty = useMemo(() => {
    return (
      name.trim() !== initial.name ||
      iconDiskPath !== null ||
      minMb !== initial.minMb ||
      maxMb !== initial.maxMb ||
      javaMode !== initial.javaMode ||
      (javaMode === "custom" && javaPath.trim() !== initial.javaPath) ||
      jvmArgs !== initial.jvmArgs
    );
  }, [name, initial, iconDiskPath, minMb, maxMb, javaMode, javaPath, jvmArgs]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const versionsToDisplay =
    internalVersions.length > 0
      ? internalVersions
      : instance.modloaderVersion
        ? [instance.modloaderVersion]
        : [];
  const loaderOptions = useMemo<CustomInputOption[]>(() => {
    return versionsToDisplay.map((v) => ({
      value: v,
      label: v === instance.modloaderVersion ? `${v} (current)` : v,
    }));
  }, [versionsToDisplay, instance.modloaderVersion]);

  return (
    <>
      <CustomModal
        isOpen={isOpen}
        onClose={handleClose}
        title={`Settings — ${instance.name} ${instance.minecraftVersion}`}
        size="large"
        closeOnEsc={!confirmDelete && !saving && !deleting}
      >
        <div className="flex flex-col gap-4">
          <div className="custom-scrollbar flex max-h-[70vh] flex-col gap-5 overflow-y-auto pr-1">
            {/* ── General ── */}
            <Section
              icon={<Box size={15} />}
              title="General"
              description={`Instance name, icon${!isVanilla ? " and loader version" : ""}.`}
            >
              <div className="flex gap-4">
                <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/5 border border-white/5">
                  {iconPreview ? (
                    <img
                      src={iconPreview}
                      alt="Instance icon"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Box
                      size={36}
                      strokeWidth={1.5}
                      className="text-gray-400"
                    />
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-3">
                  <Field label="Name">
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      maxLength={64}
                      className={inputCls}
                      placeholder="My Instance"
                    />
                  </Field>
                  <div className="flex w-full items-center justify-between gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`${secondaryBtnCls} flex-1 justify-center`}
                    >
                      <Upload size={15} />
                      Upload
                    </button>
                    <button
                      type="button"
                      className={`${secondaryBtnCls} flex-1 justify-center opacity-60`}
                    >
                      <RefreshCw size={15} />
                      Randomize
                    </button>
                    <button
                      type="button"
                      className={`${secondaryBtnCls} flex-1 justify-center opacity-60`}
                    >
                      <Palette size={15} />
                      Customize
                    </button>
                  </div>
                </div>
              </div>

              {/* Отображаем выбор версии загрузчика только если это НЕ ванилла */}
              {!isVanilla && (
                <Field
                  label={`${instance.modloader.toUpperCase()} version`}
                  hint={
                    isBusy
                      ? "Stop the game to change the version."
                      : "Applied immediately: files are verified, extras removed, missing ones downloaded."
                  }
                >
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <CustomInput
                        value={loaderSel}
                        onChange={setLoaderSel}
                        options={loaderOptions}
                        placeholder="Select loader version..."
                        isClearableOnClick
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleApplyLoader}
                      disabled={
                        !loaderSel ||
                        loaderSel === instance.modloaderVersion ||
                        applyingLoader ||
                        internalVersionsLoading ||
                        isBusy
                      }
                      className={`${accentBtnCls} shrink-0 py-2.5`}
                    >
                      {(applyingLoader || internalVersionsLoading) && (
                        <Loader2 size={15} className="animate-spin" />
                      )}
                      Apply
                    </button>
                  </div>
                </Field>
              )}
            </Section>

            {/* ── Java & memory ── */}
            <Section
              icon={<Cpu size={15} />}
              title="Java & memory"
              description="How much memory to allocate and which Java to use."
            >
              <Field
                label="Memory"
                hint={`Available on system: ${fmtMem(safeTotalMb)}. Recommended: 3–6 GB.`}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-gray-400">
                      Min{" "}
                      <span className="font-medium text-white">
                        {fmtMem(minMb)}
                      </span>
                    </span>
                    <span className="text-gray-400">
                      Max{" "}
                      <span className="font-medium text-white">
                        {fmtMem(maxMb)}
                      </span>
                    </span>
                  </div>
                  <RamRange
                    min={RAM_FLOOR}
                    max={ramMax}
                    step={RAM_STEP}
                    low={minMb}
                    high={maxMb}
                    onChange={(lo, hi) => {
                      setMinMb(lo);
                      setMaxMb(hi);
                    }}
                  />
                </div>
              </Field>

              <Field label="Java">
                <div className="flex flex-col gap-3">
                  <Segmented
                    value={javaMode}
                    onChange={(v) => {
                      setJavaMode(v);
                      setJavaCheck({ state: "idle" });
                    }}
                    options={[
                      { value: "auto", label: "Automatic" },
                      { value: "custom", label: "Custom path" },
                    ]}
                  />
                  {javaMode === "custom" && (
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <input
                          value={javaPath}
                          onChange={(e) => {
                            setJavaPath(e.target.value);
                            setJavaCheck({ state: "idle" });
                          }}
                          placeholder="C:\Program Files\Java\jdk-21\bin\javaw.exe"
                          className={inputCls}
                        />
                        <button
                          type="button"
                          onClick={handlePickJava}
                          className={`${secondaryBtnCls} shrink-0`}
                        >
                          <FolderOpen size={15} />
                          Browse
                        </button>
                        <button
                          type="button"
                          onClick={() => runJavaCheck(javaPath)}
                          disabled={
                            !javaPath.trim() || javaCheck.state === "checking"
                          }
                          className={`${secondaryBtnCls} shrink-0`}
                        >
                          {javaCheck.state === "checking" && (
                            <Loader2 size={15} className="animate-spin" />
                          )}
                          Test
                        </button>
                      </div>
                      {javaCheck.state === "ok" && (
                        <p className="flex items-center gap-1.5 text-[12px] text-green-400">
                          <CheckCircle2 size={14} /> Java {javaCheck.version}
                        </p>
                      )}
                      {javaCheck.state === "error" && (
                        <p className="flex items-center gap-1.5 text-[12px] text-red-400">
                          <XCircle size={14} /> {javaCheck.message}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </Field>

              <Field
                label="JVM arguments"
                hint="Appended to generated arguments. Example: -XX:+UseG1GC -Dfile.encoding=UTF-8"
              >
                <textarea
                  value={jvmArgs}
                  onChange={(e) => setJvmArgs(e.target.value)}
                  rows={3}
                  spellCheck={false}
                  className={`${inputCls} resize-none font-mono text-[12px]`}
                />
              </Field>
            </Section>
            <Section
              icon={<FileText size={15} />}
              title="Logs"
              description="Open the most recent game session log — useful when reporting a crash or checking what happened on the last launch."
            >
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleOpenLatestLog}
                  className={secondaryBtnCls}
                >
                  Open latest.log
                </button>
                {logError && (
                  <span className="text-[12px] text-red-400">{logError}</span>
                )}
              </div>
            </Section>
            <Section
              icon={<ShieldCheck size={15} />}
              title="Maintenance"
              description="Checks libraries, assets and the version manifest against official metadata: downloads anything missing and removes leftovers from previous loader versions."
            >
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleVerifyIntegrity}
                  disabled={isBusy || verifying}
                  className={secondaryBtnCls}
                >
                  {verifying ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <></>
                  )}
                  {verifying
                    ? verifyStatusText || "Verifying..."
                    : "Verify integrity"}
                </button>
                {verifyError && (
                  <span className="text-[12px] text-red-400">
                    {verifyError}
                  </span>
                )}
                {verifyDone && !verifying && (
                  <span className="flex items-center gap-1.5 text-[12px] text-green-400">
                    <CheckCircle2 size={14} /> Up to date
                  </span>
                )}
              </div>
              <p className="text-[12px] leading-relaxed text-gray-500">
                Run this if the game won't launch, crashes on startup, or if
                files were changed or deleted manually. Not needed after every
                regular launch. Mods, worlds, resource packs, shaders and
                configs are never touched.
              </p>
            </Section>
          </div>

          {/* footer */}
          <div className="flex items-center justify-between gap-3 border-t border-white/5 pt-4">
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              disabled={isBusy || saving || deleting}
              title={isBusy ? "Stop the game before deleting" : undefined}
              className={dangerBtnCls}
            >
              {deleting ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Trash2 size={15} />
              )}
              Delete instance
            </button>

            <div className="flex items-center gap-2.5">
              {saveError && (
                <span className="max-w-[240px] truncate text-[12px] text-red-400">
                  {saveError}
                </span>
              )}
              <button
                type="button"
                onClick={handleClose}
                disabled={saving || deleting}
                className={secondaryBtnCls}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!isDirty || !valid || saving || deleting}
                className={accentBtnCls}
              >
                {saving && <Loader2 size={15} className="animate-spin" />}
                Save changes
              </button>
            </div>
          </div>
        </div>
      </CustomModal>

      <ConfirmModal
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete instance?"
        warningText={`"${instance.name}" will be deleted along with all files: mods, worlds and configs. This action cannot be undone.`}
        yesText="Cancel"
        noText="Delete"
      />
    </>
  );
}
