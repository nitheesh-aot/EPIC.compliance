import { ComplianceFinding } from "@/models/ComplianceFinding";
import { RequirementDocumentType } from "@/models/RequirementDocumentType";
import { EnforcementAction } from "@/models/EnforcementAction";
import { OnSuccessType, request } from "@/utils/axiosUtils";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  InspectionRequirement,
  InspectionRequirementAPIData,
} from "@/models/InspectionRequirement";

const fetchEnforcementActions = (): Promise<EnforcementAction[]> => {
  return request({ url: "/enforcement-actions" });
};

const fetchComplianceFindings = (): Promise<ComplianceFinding[]> => {
  return request({ url: "/compliance-findings" });
};

const fetchDocumentTypes = (): Promise<RequirementDocumentType[]> => {
  return request({ url: "/document-types" });
};

const fetchInspectionRequirements = (
  inspectionId: number
): Promise<InspectionRequirement[]> => {
  return request({ url: `/inspections/${inspectionId}/requirements` });
};

const createInspectionRequirement = ({
  inspectionId,
  inspectionRequirement,
}: {
  inspectionId: number;
  inspectionRequirement: InspectionRequirementAPIData;
}) => {
  return request({
    url: `/inspections/${inspectionId}/requirements`,
    method: "post",
    data: inspectionRequirement,
  });
};

const updateInspectionRequirement = ({
  inspectionId,
  requirementId,
  inspectionRequirement,
}: {
  inspectionId: number;
  requirementId: number;
  inspectionRequirement: InspectionRequirementAPIData;
}) => {
  return request({
    url: `/inspections/${inspectionId}/requirements/${requirementId}`,
    method: "patch",
    data: inspectionRequirement,
  });
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

export const useInspectionRequirementsData = (inspectionId: number) => {
  return useQuery({
    queryKey: ["inspection-requirements", inspectionId],
    queryFn: () => fetchInspectionRequirements(inspectionId),
  });
};

export const useCreateInspectionRequirement = (onSuccess: OnSuccessType) => {
  return useMutation({ mutationFn: createInspectionRequirement, onSuccess });
};

export const useUpdateInspectionRequirement = (onSuccess: OnSuccessType) => {
  return useMutation({ mutationFn: updateInspectionRequirement, onSuccess });
};
