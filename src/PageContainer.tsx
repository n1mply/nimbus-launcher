type Props = {
  title: string
  children?: React.ReactNode
}

export default function PageContainer({ title, children }: Props) {
  return (
    <div className='h-full w-full flex flex-col overflow-hidden'>
      {/* Заголовок — не скроллится, всегда закреплён сверху */}
      <div className='px-6 pt-6 pb-4 shrink-0 text-left'>
        <h1 className='text-xl font-bold'>{title}</h1>
      </div>

      {/* Контент — скроллится, если не помещается */}
      <div className='flex-1 min-h-0 overflow-y-auto custom-scrollbar px-6 pb-6'>
        {children ?? (
          <p className='text-gray-500 text-sm'>Контент появится здесь</p>
        )}
      </div>
    </div>
  )
}