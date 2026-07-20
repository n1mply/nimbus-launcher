type Props = {
  name?: string
  icon: React.ReactNode
  isSelected: boolean
  onClick?: () => void
}

export default function SidebarItem({ name='', icon, isSelected, onClick }: Props) {
  return (
    <button
      onClick={isSelected ? undefined : onClick}
      className={`group relative flex items-center w-full  ${name==='' ? 'justify-center' : ''} gap-3 h-12 rounded-xl p-3 transition-all duration-300 overflow-hidden ${
        isSelected 
          ? 'bg-white/10 text-white cursor-default shadow-md' 
          : 'text-gray-400 hover:bg-white/5 hover:text-gray-200 cursor-pointer'
      }`}
    >
      {isSelected && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-blue-500 rounded-r-full shadow-[0_0_12px_theme(colors.blue.500)]" />
      )}
      <div className={`transition-transform duration-300 ${isSelected ? 'scale-110 text-blue-400' : 'group-hover:scale-110'}`}>
        {icon}
      </div>
      {name==='' ? '' : <div className="font-medium tracking-wide">{name}</div>}
    </button>
  )
}