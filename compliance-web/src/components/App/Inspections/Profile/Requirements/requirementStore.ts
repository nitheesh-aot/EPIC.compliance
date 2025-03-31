import { create } from "zustand";
import { RequirementImage } from "@/models/Image";
import { Appendix } from "@/models/Appendix";

// Define the store state and actions
interface RequirementStore {
  photos: RequirementImage[];
  figures: RequirementImage[];
  requirementPhotos: RequirementImage[];
  requirementFigures: RequirementImage[];
  appendices: Appendix[];
  isDataChanged: boolean;
  setPhotos: (photos: RequirementImage[]) => void;
  setFigures: (figures: RequirementImage[]) => void;
  setRequirementPhotos: (requirementPhotos: RequirementImage[]) => void;
  setRequirementFigures: (requirementFigures: RequirementImage[]) => void;
  setAppendices: (appendices: Appendix[]) => void;
  setIsDataChanged: (isDataChanged: boolean) => void;
  reset: () => void;
}

// Create the Zustand store
export const useRequirementStore = create<RequirementStore>((set) => ({
  photos: [],
  figures: [],
  requirementPhotos: [],
  requirementFigures: [],
  appendices: [],
  isDataChanged: false,
  setPhotos: (photos: RequirementImage[]) => set({ photos }),
  setFigures: (figures: RequirementImage[]) => set({ figures }),
  setRequirementPhotos: (requirementPhotos: RequirementImage[]) => set({ requirementPhotos }),
  setRequirementFigures: (requirementFigures: RequirementImage[]) => set({ requirementFigures }),
  setAppendices: (appendices: Appendix[]) => set({ appendices }),
  setIsDataChanged: (isDataChanged: boolean) => set({ isDataChanged }),
  reset: () => set({ photos: [], figures: [], requirementPhotos: [], requirementFigures: [], appendices: [], isDataChanged: false }),
}));
