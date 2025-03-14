import { create } from "zustand";
import { Inspection } from "@/models/Inspection";
import { DEFAULT_REPORT_TAB_CONTENT } from "@/utils/constants";
import { InspectionRequirement } from "@/models/InspectionRequirement";
import { CaseFile } from "@/models/CaseFile";

// Define the store state and actions
interface ReportStore {
  inspectionData: Inspection | undefined;
  caseFileData: CaseFile | undefined;
  inspectionSummary?: string;
  findingsStatement?: string;
  actionsRequired?: string;
  enforcementSummary?: string;
  inspectionVersionDatePreliminary?: string;
  inspectionVersionDateIssued?: string;
  inspectionRequirements?: InspectionRequirement[];
  inspectionRegulatoryConsideration?: InspectionRequirement;
  setInspectionData: (inspectionData: Inspection) => void;
  setCaseFileData: (caseFileData: CaseFile) => void;
  setInspectionSummary: (inspectionSummary: string) => void;
  setFindingsStatement: (findingsStatement: string) => void;
  setActionsRequired: (actionsRequired: string) => void;
  setEnforcementSummary: (enforcementSummary: string) => void;
  setInspectionVersionDatePreliminary: (
    inspectionVersionDatePreliminary: string
  ) => void;
  setInspectionVersionDateIssued: (inspectionVersionDateIssued: string) => void;
  setInspectionRequirements: (
    inspectionRequirements: InspectionRequirement[]
  ) => void;
  setInspectionRegulatoryConsideration: (
    inspectionRegulatoryConsideration?: InspectionRequirement
  ) => void;
  reset: () => void;
}

// Create the Zustand store
export const useReportStore = create<ReportStore>((set) => ({
  inspectionData: undefined,
  caseFileData: undefined,
  inspectionSummary: undefined,
  findingsStatement: undefined,
  actionsRequired: undefined,
  enforcementSummary: DEFAULT_REPORT_TAB_CONTENT,
  inspectionRequirements: [],
  inspectionRegulatoryConsideration: undefined,
  setInspectionData: (inspectionData: Inspection) => set({ inspectionData }),
  setCaseFileData: (caseFileData: CaseFile) => set({ caseFileData }),
  setInspectionSummary: (inspectionSummary: string) =>
    set({ inspectionSummary }),
  setFindingsStatement: (findingsStatement: string) =>
    set({ findingsStatement }),
  setActionsRequired: (actionsRequired: string) => set({ actionsRequired }),
  setEnforcementSummary: (enforcementSummary: string) =>
    set({ enforcementSummary }),
  setInspectionVersionDatePreliminary: (
    inspectionVersionDatePreliminary: string
  ) => set({ inspectionVersionDatePreliminary }),
  setInspectionVersionDateIssued: (inspectionVersionDateIssued: string) =>
    set({ inspectionVersionDateIssued }),
  setInspectionRequirements: (
    inspectionRequirements: InspectionRequirement[]
  ) => set({ inspectionRequirements }),
  setInspectionRegulatoryConsideration: (
    inspectionRegulatoryConsideration?: InspectionRequirement
  ) => set({ inspectionRegulatoryConsideration }),
  reset: () =>
    set({
      inspectionData: undefined,
      caseFileData: undefined,
      inspectionSummary: undefined,
      findingsStatement: undefined,
      actionsRequired: undefined,
      enforcementSummary: DEFAULT_REPORT_TAB_CONTENT,
      inspectionVersionDatePreliminary: undefined,
      inspectionVersionDateIssued: undefined,
      inspectionRequirements: [],
      inspectionRegulatoryConsideration: undefined,
    }),
}));
