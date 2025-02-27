import { create } from "zustand";
import { Image } from "@/models/Image";
import { Appendix } from "@/models/Appendix";

// Define the store state and actions
interface RequirementStore {
  photos: Image[];
  figures: Image[];
  appendices: Appendix[];
  isDataChanged: boolean;
  setPhotos: (photos: Image[]) => void;
  setFigures: (figures: Image[]) => void;
  setAppendices: (appendices: Appendix[]) => void;
  setIsDataChanged: (isDataChanged: boolean) => void;
  reset: () => void;
}

// Create the Zustand store
export const useRequirementStore = create<RequirementStore>((set) => ({
  photos: [],
  figures: [],
  appendices: [],
  isDataChanged: false,
  setPhotos: (photos: Image[]) => set({ photos }),
  setFigures: (figures: Image[]) => set({ figures }),
  setAppendices: (appendices: Appendix[]) => set({ appendices }),
  setIsDataChanged: (isDataChanged: boolean) => set({ isDataChanged }),
  reset: () => set({ photos: [], figures: [], appendices: [], isDataChanged: false }),
}));
