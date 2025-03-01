import { create } from "zustand"

export interface Tab {
  title: string
  url: string
}

export interface SelectedText {
  text: string
  pageType: "main" | "stack" | ""
}

type PageStore = {
  stackedPage: string
  tabs: Tab[]
  activeTab: string | null
  isChatOpen: boolean
  isStackOpen: boolean
  selectedText: SelectedText
  addTab: (tab: Tab) => void
  removeTab: (title: string) => void
  setActiveTab: (title: string) => void
  updateTabUrl: (title: string, url: string) => void
  toggleChat: () => void
  toggleStack: () => void
  addPage: (page: string) => void
  removePage: () => void
  setSelectedText: (selectedText: SelectedText) => void
}

export const usePageStore = create<PageStore>((set, ) => ({
  stackedPage: "",
  tabs: [],
  activeTab: null,
  isChatOpen: false,
  isStackOpen: true,
  selectedText: { text: "", pageType: "main" } ,
  addPage: (page: string) => set(() => ({ stackedPage: page })),
  removePage: () => set(() => ({ stackedPage: "" })),
  addTab: (tab: Tab) =>
    set((state) => {
      const existingTab = state.tabs.find((t) => t.title === tab.title)
      if (existingTab) {
        // If the tab already exists, just set it as active
        return { activeTab: tab.title }
      } else {
        // If it's a new tab, add it and set as active
        return {
          tabs: [...state.tabs, tab],
          activeTab: tab.title,
          isStackOpen: true,
        }
      }
    }),
  removeTab: (title) =>
    set((state) => {
      const newTabs = state.tabs.filter((tab) => tab.title !== title)
      return {
        tabs: newTabs,
        activeTab: state.activeTab === title ? (newTabs.length > 0 ? newTabs[0].title : null) : state.activeTab,
      }
    }),
  setActiveTab: (title) => set({ activeTab: title }),
  updateTabUrl: (title, url) =>
    set((state) => ({
      tabs: state.tabs.map((tab) => (tab.title === title ? { ...tab, url } : tab)),
    })),
  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen, selectedText: { text: state.selectedText.text, pageType: "main" } })),
  toggleStack: () => set((state) => ({ isStackOpen: !state.isStackOpen })),
  setSelectedText: (selectedText: SelectedText) => set(() => ({ selectedText })),
}))

