import { create } from "zustand";
import { Inspection } from "@/models/Inspection";

// Define the store state and actions
interface ReportStore {
  inspectionData: Inspection | undefined;
  setInspectionData: (inspectionData: Inspection) => void;
  reset: () => void;
}

// Create the Zustand store
export const useReportStore = create<ReportStore>((set) => ({
  inspectionData: undefined,
  setInspectionData: (inspectionData: Inspection) => set({ inspectionData }),
  reset: () => set({ inspectionData: undefined }),
}));
