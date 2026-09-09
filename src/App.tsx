import { useState } from "react";
import HeaderMenu from "./HeaderMenu";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import AccountSection from "./AccountSection";
import type { TabId } from "./types";

import InstancesPage from "./pages/InstancesPage";
import ModPacksPage from "./pages/ModPacksPage";
import ModsPage from "./pages/ModsPage";
import ResourcePacksPage from "./pages/ResourcePacksPage";
import ShadersPage from "./pages/ShadersPage";
import SettingsPage from "./pages/SettingsPage";

import { LauncherProvider } from "./contexts/laucherContext";

function renderPage(tab: TabId) {
  switch (tab) {
    case "instances":
      return <InstancesPage />;
    case "mods":
      return <ModsPage />;
    case "modpacks":
      return <ModPacksPage />;
    case "resourcepacks":
      return <ResourcePacksPage />;
    case "shaders":
      return <ShadersPage />;
    case "settings":
      return <SettingsPage />;
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("instances");

  return (
    <LauncherProvider>
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0D1017] text-white select-none font-montserrat relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

        <HeaderMenu />
        <div className="flex-1 min-h-0 relative z-10">
          <div className="flex p-6 h-full gap-5">
            <Sidebar activeTab={activeTab} onSelect={setActiveTab} />

            <main className="bg-gradient-to-b from-[#1E2029] to-[#14151C] backdrop-blur-sm h-full w-[60%] flex-1 rounded-xl border border-white/5 overflow-hidden shadow-2xl shadow-black/40 flex flex-col">
              {renderPage(activeTab)}
            </main>

            <AccountSection />
          </div>
        </div>
        <Footer />
      </div>
    </LauncherProvider>
  );
}
