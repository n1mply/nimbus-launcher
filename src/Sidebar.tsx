import SidebarItem from './SidebarItem'
import { mainNavItems, bottomNavItems } from './config/navigation'
import type { TabId } from './types'

type Props = {
  activeTab: TabId
  onSelect: (tab: TabId) => void
}

export default function Sidebar({ activeTab, onSelect }: Props) {
  return (
    <nav className='bg-gradient-to-b from-[#1E2029] to-[#14151C] backdrop-blur-sm w-[20%] shadow-2xl shadow-black/40 h-full rounded-xl border border-white/5 flex justify-between flex-col p-2'>
      <div className='flex flex-col gap-3'>
        {mainNavItems.map((item) => (
          <SidebarItem
            key={item.id}
            name={item.name}
            icon={item.icon}
            isSelected={activeTab === item.id}
            onClick={() => onSelect(item.id)}
          />
        ))}
      </div>
      <div className='flex flex-col gap-3'>
        {bottomNavItems.map((item) => (
          <SidebarItem
            key={item.id}
            name={item.name}
            icon={item.icon}
            isSelected={activeTab === item.id}
            onClick={() => onSelect(item.id)}
          />
        ))}
      </div>
    </nav>
  )
}