import { Library, FileBox, Package, Image, Sparkle, Settings } from 'lucide-react'
import type { TabId } from '../types'

export type NavItem = {
  id: TabId
  name: string
  icon: React.ReactNode
}

export const mainNavItems: NavItem[] = [
  { id: 'instances', name: 'Instances', icon: <Library size={24} /> },
  { id: 'mods', name: 'Mods', icon: <FileBox size={24} /> },
  { id: 'modpacks', name: 'Mod Packs', icon: <Package size={24} /> },
  { id: 'resourcepacks', name: 'Resourse Packs', icon: <Image size={24} /> },
  { id: 'shaders', name: 'Shaders', icon: <Sparkle size={24} /> },
]

export const bottomNavItems: NavItem[] = [
  { id: 'settings', name: 'Settings', icon: <Settings size={24} /> },
]