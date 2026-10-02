export type TabId =
  | "instances"
  | "mods"
  | "modpacks"
  | "resourcepacks"
  | "shaders"
  | "datapacks"
  | "settings"
  | "contentView";

export type Account = {
  uuid: string;
  username: string;
  skinUrl: string;
  capeUrl?: string | null;
};

export type LibrarySkin = {
  fileName: string;
  isActive: boolean;
  url: string;
};

export type Cape = {
  id: string;
  name: string;
  url: string;
  isActive: boolean;
};

export type Instance = {
  id: string;
  name: string;
  modloader: ModloaderType;
  minecraftVersion: string;
  modloaderVersion?: string | null;
  launchVersionId?: string | null;
  instanceIconPath?: string;
  status?: InstanceStatus;
  launchSettings?: LaunchSettings;
};

export type VersionType = "release" | "snapshot";

export type Version = {
  id: string;
  versionType: VersionType;
  url: string;
};

export type InstanceStatus = "empty" | "installing" | "installed" | "crushed";

export type ModloaderType =
  | "vanilla"
  | "fabric"
  | "forge"
  | "neoforge"
  | "quilt";

export interface DownloadTask {
  url: string;
  targetPath: string;
  size: number;
  sha1?: string;
}

export interface IntegrityResult {
  queue: DownloadTask[];
  totalBytesToDownload: number;
  modloaderVersion: string | null;
  versionId: string | null; // null = id определит установщик загрузчика (Forge/NeoForge)
}

export type Status =
  | "loading"
  | "installed"
  | "not_installed"
  | "launching"
  | "running"
  | "error";

export interface LaunchSettings {
  memory?: {
    minMb: number;
    maxMb: number;
  };
  java?: {
    mode: "auto" | "custom";
    path?: string;
  };
  jvmArgs?: string;
}

export type ContentType = "mod" | "shader" | "resourcepack" | "datapack" | "modpack";
export type ContentSource = "modrinth" | "curseforge";

export interface ContentTag {
  label: string;
  variant: "loader" | "generic";
}

export interface ContentItem {
  id: string;
  source: ContentSource;
  type: ContentType;
  name: string;
  author: string;
  authorUrl?: string;
  summary: string;
  iconUrl: string;
  iconBg: string;
  downloads: number;
  follows: number;
  updatedAt: string; // ISO
  tags: ContentTag[];
}

export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2).replace(/\.?0+$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

export function formatRelativeTime(iso: string): string {
  const days = Math.round((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.round(days / 7);
  if (weeks < 5) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
  const years = Math.round(days / 365);
  return `${years} year${years > 1 ? "s" : ""} ago`;
}


export type GameMode = "survival" | "creative" | "adventure" | "spectator" | "hardcore";
export type WorldDifficulty = "peaceful" | "easy" | "normal" | "hard";

export interface World {
  folderName: string;
  name: string;
  instanceFolderName: string;
  gameMode: GameMode;
  difficulty: WorldDifficulty;
  lastPlayed?: number;
  iconPath?: string | null;
  versionName?: string;
}