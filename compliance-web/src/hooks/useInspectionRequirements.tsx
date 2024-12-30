import { ComplianceFinding } from "@/models/ComplianceFinding";
import { EnforcementAction } from "@/models/EnforcementAction";
import { request } from "@/utils/axiosUtils";
import { useQuery } from "@tanstack/react-query";

const fetchEnforcementActions = (): Promise<EnforcementAction[]> => {
  return request({ url: "/enforcement-actions" });
};

const fetchComplianceFindings = (): Promise<ComplianceFinding[]> => {
  return request({ url: "/compliance-findings" });
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
