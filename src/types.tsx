export type TabId = 'instances' | 'mods' | 'modpacks' | 'resourcepacks' | 'shaders' | 'settings'

export type Account = { 
  uuid: string;
  username: string; 
  skinUrl: string; 
  capeUrl?: string | null;
}

export type LibrarySkin = {
  fileName: string;
  isActive: boolean;
  url: string;
}

export type Cape = {
  id: string;
  name: string;
  url: string;
  isActive: boolean;
}

export type Instance = {
  name: string;
  modloader: 'vanilla' | 'fabric' | 'forge' | 'neoforge' | 'quilt';
  minecraftVersion: string;
  modloaderVersion?: string|null;
  instanceIconPath?: string;
}

export type VersionType = 'release' | 'snapshot'

export type Version = {
  id: string;
  versionType: VersionType;
  url: string;
}