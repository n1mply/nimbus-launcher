import { useState } from 'react'
import HeaderMenu from './HeaderMenu'
import Sidebar from './Sidebar'
import Footer from './Footer'
import AccountSection from './AccountSection'
import type { TabId } from './types'

import InstancesPage from './pages/InstancesPage'
import ModPacksPage from './pages/ModPacksPage'
import ModsPage from './pages/ModsPage'
import ResourcePacksPage from './pages/ResourcePacksPage'
import ShadersPage from './pages/ShadersPage'
import SettingsPage from './pages/SettingsPage'

function renderPage(tab: TabId) {
  switch (tab) {
    case 'instances': return <InstancesPage />
    case 'mods': return <ModsPage />
    case 'modpacks': return <ModPacksPage />
    case 'resourcepacks': return <ResourcePacksPage />
    case 'shaders': return <ShadersPage />
    case 'settings': return <SettingsPage />
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('instances')

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0D1017] text-white select-none font-montserrat">
      <HeaderMenu />
      <div className='flex-1 min-h-0'>
        <div className="flex p-6 h-full gap-4">
          <Sidebar activeTab={activeTab} onSelect={setActiveTab} />
          <main className='bg-[#1E2029] h-full w-[60%] rounded-xl border border-white/5 overflow-hidden'>
            {renderPage(activeTab)}
          </main>
          <AccountSection />
        </div>
      </div>
      <Footer />
    </div>
  )
}