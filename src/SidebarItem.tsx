type Props = {
  name: string
  icon: React.ReactNode
  isSelected: boolean
  onClick?: () => void
}

export default function SidebarItem({ name, icon, isSelected, onClick }: Props) {
  return (
    <button
      onClick={isSelected ? undefined : onClick}
      className={`flex items-center w-full border gap-2 h-12 rounded-xl p-3
       text-gray-400 hover:text-white transition-colors ${
         isSelected ? 'border-white text-white cursor-default' : 'border-white/5 cursor-pointer'
       }`}
    >
      {icon}
      <div>{name}</div>
    </button>
  )
}