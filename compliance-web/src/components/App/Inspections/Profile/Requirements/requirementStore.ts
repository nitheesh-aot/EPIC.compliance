import { create } from "zustand";
import { Image } from "@/models/Image";

// Define the store state and actions
interface RequirementStore {
  photos: Image[];
  figures: Image[];
  isDataChanged: boolean;
  setPhotos: (photos: Image[]) => void;
  setFigures: (figures: Image[]) => void;
  setIsDataChanged: (isDataChanged: boolean) => void;
  reset: () => void;
}

// Create the Zustand store
export const useRequirementStore = create<RequirementStore>((set) => ({
  photos: [],
  figures: [],
  isDataChanged: false,
  setPhotos: (photos: Image[]) => set({ photos }),
  setFigures: (figures: Image[]) => set({ figures }),
  setIsDataChanged: (isDataChanged: boolean) => set({ isDataChanged }),
  reset: () => set({ photos: [], figures: [], isDataChanged: false }),
}));
