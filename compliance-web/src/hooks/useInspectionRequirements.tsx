import { ComplianceFinding } from "@/models/ComplianceFinding";
import { RequirementDocumentType } from "@/models/RequirementDocumentType";
import { EnforcementAction } from "@/models/EnforcementAction";
import { OnSuccessType, request } from "@/utils/axiosUtils";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  InspectionRequirement,
  InspectionRequirementAPIData,
} from "@/models/InspectionRequirement";
import { InspectionRequirementType } from "@/models/InspectionRequirementType";
import { Image } from "@/models/Image";

const fetchInspectionRequirementTypes = (): Promise<
  InspectionRequirementType[]
> => {
  return request({ url: "/inspection-requirement-types" });
};

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

const fetchInspectionRequirementImages = (
  inspectionId: number,
  requirementId: number,
  imageType: "photos" | "figures"
): Promise<Image[]> => {
  return request({
    url: `/inspections/${inspectionId}/requirements/${requirementId}/${imageType}`,
  });
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

const updateInspectionRequirementOrder = ({
  inspectionId,
  requirementId,
  sortOrder,
}: {
  inspectionId: number;
  requirementId: number;
  sortOrder: number;
}) => {
  return request({
    url: `/inspections/${inspectionId}/requirements/${requirementId}/sort-order`,
    method: "patch",
    data: {
      order: sortOrder,
    },
  });
};

const deleteInspectionRequirement = ({
  inspectionId,
  requirementId,
}: {
  inspectionId: number;
  requirementId: number;
}) => {
  return request({
    url: `/inspections/${inspectionId}/requirements/${requirementId}`,
    method: "delete",
  });
};

export const useInspectionRequirementTypesData = () => {
  return useQuery({
    queryKey: ["inspection-requirement-types"],
    queryFn: fetchInspectionRequirementTypes,
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

export const useInspectionRequirementImagesData = (
  inspectionId: number,
  requirementId: number,
  imageType: "photos" | "figures"
) => {
  return useQuery({
    queryKey: [
      "inspection-requirement-images",
      inspectionId,
      requirementId,
      imageType,
    ],
    queryFn: () =>
      fetchInspectionRequirementImages(inspectionId, requirementId, imageType),
    select: (data: Image[]) => {
      return data.map((image) => ({
        ...image,
        dbId: image.id,
      }));
    },
    enabled: !!inspectionId && !!requirementId,
    refetchOnWindowFocus: false,
  });
};

export const useCreateInspectionRequirement = (onSuccess: OnSuccessType) => {
  return useMutation({ mutationFn: createInspectionRequirement, onSuccess });
};

export const useUpdateInspectionRequirement = (onSuccess: OnSuccessType) => {
  return useMutation({ mutationFn: updateInspectionRequirement, onSuccess });
};

export const useUpdateInspectionRequirementOrder = (
  onSuccess: OnSuccessType
) => {
  return useMutation({
    mutationFn: updateInspectionRequirementOrder,
    onSuccess,
  });
};

export const useDeleteInspectionRequirement = (onSuccess: OnSuccessType) => {
  return useMutation({ mutationFn: deleteInspectionRequirement, onSuccess });
};
