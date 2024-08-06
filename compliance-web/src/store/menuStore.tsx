import { create } from "zustand";
import { persist } from "zustand/middleware";

interface MenuState {
  openMenus: { [key: string]: boolean };
  expandMenu: boolean;
  appHeaderHeight: number;
  toggleMenu: (routeName: string) => void;
  toggleExpandMenu: () => void;
  setAppHeaderHeight: (height: number) => void;
}

export const useMenuStore = create<MenuState>()(
  persist(
    (set) => ({
      openMenus: {},
      expandMenu: true,
      appHeaderHeight: 0,
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
      setAppHeaderHeight: (height: number) => {
        set(() => ({
          appHeaderHeight: height,
        }));
      }
    }),
    {
      name: "menu-storage", // name of the item in the storage
    }
  )
);
