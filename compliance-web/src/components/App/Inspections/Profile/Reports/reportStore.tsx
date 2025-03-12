import { create } from "zustand";
import { Inspection } from "@/models/Inspection";

const DEFAULT_ENFORCEMENT_SUMMARY = `<p class="editor-paragraph">None at this time.</p>`;

// Define the store state and actions
interface ReportStore {
  inspectionData: Inspection | undefined;
  inspectionSummary?: string;
  findingsStatement?: string;
  actionsRequired?: string;
  enforcementSummary?: string;
  setInspectionData: (inspectionData: Inspection) => void;
  setInspectionSummary: (inspectionSummary: string) => void;
  setFindingsStatement: (findingsStatement: string) => void;
  setActionsRequired: (actionsRequired: string) => void;
  setEnforcementSummary: (enforcementSummary: string) => void;
  reset: () => void;
}

// Create the Zustand store
export const useReportStore = create<ReportStore>((set) => ({
  inspectionData: undefined,
  inspectionSummary: undefined,
  findingsStatement: undefined,
  actionsRequired: undefined,
  enforcementSummary: DEFAULT_ENFORCEMENT_SUMMARY,
  setInspectionData: (inspectionData: Inspection) => set({ inspectionData }),
  setInspectionSummary: (inspectionSummary: string) =>
    set({ inspectionSummary }),
  setFindingsStatement: (findingsStatement: string) =>
    set({ findingsStatement }),
  setActionsRequired: (actionsRequired: string) => set({ actionsRequired }),
  setEnforcementSummary: (enforcementSummary: string) =>
    set({ enforcementSummary }),
  reset: () =>
    set({
      inspectionData: undefined,
      inspectionSummary: undefined,
      findingsStatement: undefined,
      actionsRequired: undefined,
      enforcementSummary: DEFAULT_ENFORCEMENT_SUMMARY,
    }),
}));
