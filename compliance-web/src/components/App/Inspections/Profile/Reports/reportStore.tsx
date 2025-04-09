import { create } from "zustand";
import { Inspection } from "@/models/Inspection";
import { DEFAULT_REPORT_TAB_CONTENT } from "@/utils/constants";
import { InspectionRequirement } from "@/models/InspectionRequirement";
import { CaseFile } from "@/models/CaseFile";
import { InspectionRecord } from "@/models/InspectionRecord";
import { QueryClient } from "@tanstack/react-query";
// Define the store state and actions
interface ReportStore {
  queryClient: QueryClient;
  inspectionReportsData: InspectionRecord | undefined;
  inspectionData: Inspection | undefined;
  caseFileData: CaseFile | undefined;
  inspectionScope?: string;
  findingsStatement?: string;
  actionsRequired?: string;
  enforcementSummary?: string;
  inspectionVersionDatePreliminary?: string;
  inspectionVersionDateIssued?: string;
  inspectionRequirements?: InspectionRequirement[];
  inspectionRegulatoryConsideration?: InspectionRequirement;

  setQueryClient: (queryClient: QueryClient) => void;
  setInspectionReportsData: (inspectionReportsData: InspectionRecord) => void;
  setInspectionData: (inspectionData: Inspection) => void;
  setCaseFileData: (caseFileData: CaseFile) => void;
  setInspectionScope: (inspectionScope: string) => void;
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
  queryClient: new QueryClient(),
  inspectionReportsData: undefined,
  inspectionData: undefined,
  caseFileData: undefined,
  inspectionScope: undefined,
  findingsStatement: undefined,
  actionsRequired: undefined,
  enforcementSummary: DEFAULT_REPORT_TAB_CONTENT,
  inspectionRequirements: [],
  inspectionRegulatoryConsideration: undefined,
  setQueryClient: (queryClient: QueryClient) => set({ queryClient }),
  setInspectionReportsData: (inspectionReportsData: InspectionRecord) => {
    const queryClient = useReportStore.getState().queryClient;
    const inspectionData = useReportStore.getState().inspectionData;
    set({ inspectionReportsData });
    queryClient.setQueryData(
      ["inspection-reports", inspectionData?.id],
      inspectionReportsData
    );
  },
  setInspectionData: (inspectionData: Inspection) => set({ inspectionData }),
  setCaseFileData: (caseFileData: CaseFile) => set({ caseFileData }),
  setInspectionScope: (inspectionScope: string) => set({ inspectionScope }),
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
      inspectionReportsData: undefined,
      inspectionData: undefined,
      caseFileData: undefined,
      inspectionScope: undefined,
      findingsStatement: undefined,
      actionsRequired: undefined,
      enforcementSummary: DEFAULT_REPORT_TAB_CONTENT,
      inspectionVersionDatePreliminary: undefined,
      inspectionVersionDateIssued: undefined,
      inspectionRequirements: [],
      inspectionRegulatoryConsideration: undefined,
    }),
}));
