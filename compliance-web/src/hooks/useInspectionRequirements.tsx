import { ComplianceFinding } from "@/models/ComplianceFinding";
import { RequirementDocumentType } from "@/models/RequirementDocumentType";
import { EnforcementAction } from "@/models/EnforcementAction";
import { request } from "@/utils/axiosUtils";
import { useQuery } from "@tanstack/react-query";

const fetchEnforcementActions = (): Promise<EnforcementAction[]> => {
  return request({ url: "/enforcement-actions" });
};

const fetchComplianceFindings = (): Promise<ComplianceFinding[]> => {
  return request({ url: "/compliance-findings" });
};

const fetchDocumentTypes = (): Promise<RequirementDocumentType[]> => {
  return request({ url: "/document-types" });
};

export const useEnforcementActionsData = () => {
  return useQuery({
    queryKey: ["enforcement-actions"],
    queryFn: fetchEnforcementActions,
  });
};

export const useComplianceFindingsData = () => {
  return useQuery({
    queryKey: ["compliance-findings"],
    queryFn: fetchComplianceFindings,
  });
};

export const useDocumentTypesData = () => {
  return useQuery({
    queryKey: ["document-types"],
    queryFn: fetchDocumentTypes,
  });
};
