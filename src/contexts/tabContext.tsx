import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { ContentItem, TabId } from "../types";

type TabContextValue = {
  activeTab: TabId;
  /** Какая вкладка подсвечена в сайдбаре (для contentView — та, откуда пришли) */
  sidebarTab: TabId;
  setActiveTab: (tab: TabId) => void;

  /** Контент, открытый на странице подробного просмотра */
  selectedContent: ContentItem | null;
  openContent: (item: ContentItem) => void;
  /** Вернуться на вкладку, с которой открыли контент */
  closeContent: () => void;
};

const TabContext = createContext<TabContextValue | null>(null);

export function TabProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTabState] = useState<TabId>("instances");
  const [originTab, setOriginTab] = useState<TabId>("mods");
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(
    null,
  );

  const activeRef = useRef(activeTab);
  activeRef.current = activeTab;

  const setActiveTab = useCallback((tab: TabId) => {
    setActiveTabState(tab);
    if (tab !== "contentView") setSelectedContent(null);
  }, []);

  const openContent = useCallback((item: ContentItem) => {
    if (activeRef.current !== "contentView") setOriginTab(activeRef.current);
    setSelectedContent(item);
    setActiveTabState("contentView");
  }, []);

  const closeContent = useCallback(() => {
    setActiveTab(originTab);
  }, [originTab, setActiveTab]);

  const value = useMemo<TabContextValue>(
    () => ({
      activeTab,
      sidebarTab: activeTab === "contentView" ? originTab : activeTab,
      setActiveTab,
      selectedContent,
      openContent,
      closeContent,
    }),
    [
      activeTab,
      originTab,
      setActiveTab,
      selectedContent,
      openContent,
      closeContent,
    ],
  );

  return <TabContext.Provider value={value}>{children}</TabContext.Provider>;
}

export function useTab(): TabContextValue {
  const ctx = useContext(TabContext);
  if (!ctx) throw new Error("useTab must be used inside <TabProvider>");
  return ctx;
}
