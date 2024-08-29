import { create } from "zustand";

// Define the store state and actions
interface DrawerStore {
  isOpen: boolean;
  drawerContent: React.ReactNode | null;
  drawerWidth: string;
  setOpen: (args: { modal: React.ReactNode; width: string }) => Promise<void>;
  setClose: () => void;
}

// Create the Zustand store
export const useDrawer = create<DrawerStore>((set) => ({
  isOpen: false,
  drawerContent: null,
  drawerWidth: "420px", // default Width

  setOpen: async ({modal, width}) => {
    if (modal) {
      set(() => ({
        drawerContent: modal,
        drawerWidth: width,
        isOpen: true,
      }));
    }
  },

  setClose: () => {
    set({
      isOpen: false,
    });
  },
}));
