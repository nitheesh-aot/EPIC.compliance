import { create } from "zustand";

// Define the store state and actions
interface TabStore {
  currentTab: number;
  setCurrentTab: (tab: number) => void;
  resetTab: () => void;
}

// Create the Zustand store
export const useTab = create<TabStore>((set) => ({
  currentTab: 0,
  setCurrentTab: (tab: number) => {
    set({ currentTab: tab });
  },
  resetTab: () => {
    set({ currentTab: 0 });
  },
}));
