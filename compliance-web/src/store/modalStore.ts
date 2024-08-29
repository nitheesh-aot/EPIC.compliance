import { create } from "zustand";

// Define the store state and actions
interface ModalStore {
  isOpen: boolean;
  modalContent: React.ReactNode | null;
  modalWidth: string;
  setOpen: (args: { content: React.ReactNode; width?: string }) => Promise<void>;
  setClose: () => void;
}

// Create the Zustand store
export const useModal = create<ModalStore>((set) => ({
  isOpen: false,
  modalContent: null,
  modalWidth: "",

  setOpen: async ({ content, width = "400px" }) => {
    if (content) {
      set(() => ({
        modalWidth: width,
        modalContent: content,
        isOpen: true,
      }));
    }
  },

  setClose: () => {
    set({
      isOpen: false,
      modalContent: null,
    });
  },
}));
