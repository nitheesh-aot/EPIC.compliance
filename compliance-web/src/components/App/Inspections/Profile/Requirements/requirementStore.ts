import { create } from "zustand";
import { RequirementImage } from "@/models/Image";
import { Appendix } from "@/models/Appendix";
import { InspectionRequirement } from "@/models/InspectionRequirement";

// Define the store state and actions
interface RequirementStore {
  requirementsList: InspectionRequirement[];
  requirementPhotos: Record<number, RequirementImage[]>;
  requirementFigures: Record<number, RequirementImage[]>;
  appendices: Appendix[];
  isDataChanged: boolean;
  setRequirementsList: (requirementsList: InspectionRequirement[]) => void;
  setRequirementPhotos: (requirementPhotos: Record<number, RequirementImage[]>) => void;
  setRequirementFigures: (requirementFigures: Record<number, RequirementImage[]>) => void;
  setAppendices: (appendices: Appendix[]) => void;
  setIsDataChanged: (isDataChanged: boolean) => void;
  reset: () => void;
}

// Create the Zustand store
export const useRequirementStore = create<RequirementStore>((set) => ({
  requirementsList: [],
  requirementPhotos: {},
  requirementFigures: {},
  appendices: [],
  isDataChanged: false,
  setRequirementsList: (requirementsList: InspectionRequirement[]) => set({ requirementsList }),
  setRequirementPhotos: (requirementPhotos: Record<number, RequirementImage[]>) => set({ requirementPhotos }),
  setRequirementFigures: (requirementFigures: Record<number, RequirementImage[]>) => set({ requirementFigures }),
  setAppendices: (appendices: Appendix[]) => set({ appendices }),
  setIsDataChanged: (isDataChanged: boolean) => set({ isDataChanged }),
  reset: () => set({ requirementsList: [], requirementPhotos: {}, requirementFigures: {}, appendices: [], isDataChanged: false }),
}));
