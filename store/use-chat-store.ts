import { create } from "zustand";

export type ChatId = {
  id: string | null;
};

type ChatStore = {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
};

export const useChatStore = create<ChatStore>((set) => ({
  chats: [],
  isSidebarOpen: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

}));