export type TabId =
  | "instances"
  | "mods"
  | "modpacks"
  | "resourcepacks"
  | "shaders"
  | "settings";

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
  id?: string;
  name: string;
  modloader: ModloaderType;
  minecraftVersion: string;
  modloaderVersion?: string | null;
  launchVersionId?: string | null;
  instanceIconPath?: string;
  status?: InstanceStatus;
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