import { create } from "zustand";

// Define the store state and actions
interface PopoverStore {
  anchorEl: HTMLElement | null;
  popoverContent: React.ReactNode | null;
  popoverWidth: string;
  setOpen: (args: { anchorEl: HTMLElement | null; content: React.ReactNode; width?: string }) => Promise<void>;
  setClose: () => void;
}

// Create the Zustand store
export const usePopover = create<PopoverStore>((set) => ({
  anchorEl: null,
  popoverContent: null,
  popoverWidth: "",

  setOpen: async ({ anchorEl, content, width = "400px" }) => {
    if (anchorEl && content) {
      set(() => ({
        anchorEl: anchorEl,
        popoverWidth: width,
        popoverContent: content,
      }));
    }
  },

  setClose: () => {
    set({
      popoverContent: null,
      anchorEl: null,
    });
  },
}));
