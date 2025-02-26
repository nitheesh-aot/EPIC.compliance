import { create } from "zustand";
import { Image } from "@/models/Image";

// Define the store state and actions
interface RequirementStore {
  photos: Image[];
  figures: Image[];
  setPhotos: (photos: Image[]) => void;
  setFigures: (figures: Image[]) => void;
  reset: () => void;
}

// Create the Zustand store
export const useRequirementStore = create<RequirementStore>((set) => ({
  photos: [],
  figures: [],
  setPhotos: (photos: Image[]) => set({ photos }),
  setFigures: (figures: Image[]) => set({ figures }),
  reset: () => set({ photos: [], figures: [] }),
}));
