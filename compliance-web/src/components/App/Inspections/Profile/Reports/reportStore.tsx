import { create } from "zustand";
import { Inspection } from "@/models/Inspection";

// Define the store state and actions
interface ReportStore {
  inspectionData: Inspection | undefined;
  inspectionSummary?: string;
  findingsStatement?: string;
  setInspectionData: (inspectionData: Inspection) => void;
  setInspectionSummary: (inspectionSummary: string) => void;
  setFindingsStatement: (findingsStatement: string) => void;
  reset: () => void;
}

// Create the Zustand store
export const useReportStore = create<ReportStore>((set) => ({
  inspectionData: undefined,
  inspectionSummary: undefined,
  findingsStatement: undefined,
  setInspectionData: (inspectionData: Inspection) => set({ inspectionData }),
  setInspectionSummary: (inspectionSummary: string) =>
    set({ inspectionSummary }),
  setFindingsStatement: (findingsStatement: string) =>
    set({ findingsStatement }),
  reset: () =>
    set({
      inspectionData: undefined,
      inspectionSummary: undefined,
      findingsStatement: undefined,
    }),
}));
