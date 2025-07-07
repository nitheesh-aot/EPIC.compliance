import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MasterTableColumnFilter } from "@/components/Shared/FilterSelect/type";

interface CachedFilterState {
  columnFilters: MasterTableColumnFilter[];
  externalFilters?: Record<string, unknown>;
}

interface CachedFiltersState {
  filters: { [key: string]: CachedFilterState };
  setFilters: (storageKey: string, filters: MasterTableColumnFilter[], externalFilters?: Record<string, unknown>) => void;
  getFilters: (storageKey: string) => MasterTableColumnFilter[];
  getExternalFilters: (storageKey: string) => Record<string, unknown> | undefined;
  getCachedFilterState: (storageKey: string) => CachedFilterState;
  clearFilters: (storageKey: string) => void;
  clearAllFilters: () => void;
}

export const cachedFiltersStore = create<CachedFiltersState>()(
  persist(
    (set, get) => ({
      filters: {},
      setFilters: (storageKey: string, filters: MasterTableColumnFilter[], externalFilters?: Record<string, unknown>) => {
        set((state) => ({
          filters: {
            ...state.filters,
            [storageKey]: {
              columnFilters: filters,
              ...(externalFilters && { externalFilters }),
            },
          },
        }));
      },
      getFilters: (storageKey: string) => {
        return get().filters[storageKey]?.columnFilters || [];
      },
      getExternalFilters: (storageKey: string) => {
        return get().filters[storageKey]?.externalFilters;
      },
      getCachedFilterState: (storageKey: string) => {
        return get().filters[storageKey] || { columnFilters: [] };
      },
      clearFilters: (storageKey: string) => {
        set((state) => {
          const newFilters = { ...state.filters };
          delete newFilters[storageKey];
          return { filters: newFilters };
        });
      },
      clearAllFilters: () => {
        set({ filters: {} });
      },
    }),
    {
      name: "cached-filters-storage",
      storage: {
        getItem: (name) => {
          try {
            const data = sessionStorage.getItem(name);
            return data ? JSON.parse(data) : null;
          } catch (error) {
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            sessionStorage.setItem(name, JSON.stringify(value));
          } catch (error) {
            // Silently handle error
          }
        },
        removeItem: (name) => {
          try {
            sessionStorage.removeItem(name);
          } catch (error) {
            // Silently handle error
          }
        },
      },
    }
  )
);

