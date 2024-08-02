import { create } from "zustand";
import { persist } from "zustand/middleware";

interface MenuState {
  openMenus: { [key: string]: boolean };
  expandMenu: boolean;
  toggleMenu: (routeName: string) => void;
  toggleExpandMenu: () => void;
}

export const useMenuStore = create<MenuState>()(
  persist(
    (set) => ({
      openMenus: {},
      expandMenu: true,
      toggleMenu: (routeName: string) => {
        set((state) => ({
          openMenus: {
            ...state.openMenus,
            [routeName]: !state.openMenus[routeName],
          },
        }));
      },
      toggleExpandMenu: () => {
        set((state) => ({
          expandMenu: !state.expandMenu,
        }));
      },
    }),
    {
      name: "menu-storage", // name of the item in the storage
    }
  )
);
