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