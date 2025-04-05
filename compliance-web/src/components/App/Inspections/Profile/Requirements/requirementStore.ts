import { create } from "zustand";
import { RequirementImage } from "@/models/Image";
import { Appendix } from "@/models/Appendix";
import { InspectionRequirement } from "@/models/InspectionRequirement";

// Define the store state and actions
interface RequirementStore {
  requirementsList: InspectionRequirement[];
  requirementPhotos: Map<number, RequirementImage[]>;
  requirementFigures: Map<number, RequirementImage[]>;
  appendices: Appendix[];
  isDataChanged: boolean;
  isImageChanged: boolean;
  setRequirementsList: (requirementsList: InspectionRequirement[]) => void;
  setRequirementPhotos: (requirementPhotos: Map<number, RequirementImage[]>) => void;
  setRequirementFigures: (requirementFigures: Map<number, RequirementImage[]>) => void;
  setAppendices: (appendices: Appendix[]) => void;
  setIsDataChanged: (isDataChanged: boolean) => void;
  setIsImageChanged: (isImageChanged: boolean) => void;
  resetRequirementStoreFlags: () => void;
  reset: () => void;
}

// Create the Zustand store
export const useRequirementStore = create<RequirementStore>((set) => ({
  requirementsList: [],
  requirementPhotos: new Map(),
  requirementFigures: new Map(),
  appendices: [],
  isDataChanged: false,
  isImageChanged: false,
  setRequirementsList: (requirementsList: InspectionRequirement[]) => set({ requirementsList }),
  setRequirementPhotos: (requirementPhotos: Map<number, RequirementImage[]>) => set({ requirementPhotos }),
  setRequirementFigures: (requirementFigures: Map<number, RequirementImage[]>) => set({ requirementFigures }),
  setAppendices: (appendices: Appendix[]) => set({ appendices }),
  setIsDataChanged: (isDataChanged: boolean) => set({ isDataChanged }),
  setIsImageChanged: (isImageChanged: boolean) => set({ isImageChanged }),
  resetRequirementStoreFlags: () => set({ isDataChanged: false, isImageChanged: false }),
  reset: () => set({ requirementsList: [], requirementPhotos: new Map(), requirementFigures: new Map(), appendices: [], isDataChanged: false, isImageChanged: false }),
}));
