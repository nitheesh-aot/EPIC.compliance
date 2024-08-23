import {create} from 'zustand'

// Define the store state and actions
interface DrawerStore {
  isOpen: boolean
  drawerContent: React.ReactNode | null
  setOpen: (modal: React.ReactNode) => Promise<void>
  setClose: () => void
}

// Create the Zustand store
export const useDrawer = create<DrawerStore>((set) => ({
  isOpen: false,
  drawerContent: null,

  setOpen: async (modal) => {
    if (modal) {
      set(() => ({
        drawerContent: modal,
        isOpen: true,
      }))
    }
  },

  setClose: () => {
    set({
      isOpen: false,
    })
  },
}))
