import { OnSuccessType, request } from "@/utils/axiosUtils";
import {
  InspectionRequirementGridItems,
  InspectionRequirementGridQueryParams,
} from "@/models/InspectionRequirementGrid";
import { useMutation, useQuery } from "@tanstack/react-query";

const fetchInspectionRequirementsGrid = (
  queryParams: InspectionRequirementGridQueryParams
): Promise<InspectionRequirementGridItems> => {
  return request({ url: "/inspection-requirements", params: queryParams });
};

const inspectionRequirementExport = (
  queryParams: InspectionRequirementGridQueryParams = {}
) => {
  delete queryParams.page_no;
  delete queryParams.page_size;
  return request({
    method: "POST",
    url: `/inspection-requirements/export`,
    data: queryParams,
    responseType: "blob",
  });
};

export const useInspectionRequirementsGrid = (
  queryParams: InspectionRequirementGridQueryParams = {}
) => {
  return useQuery({
    queryKey: ["inspection-requirements-grid", queryParams],
    queryFn: () => fetchInspectionRequirementsGrid(queryParams),
  });
};

export const useInspectionRequirementExport = (onSuccess: OnSuccessType) => {
  return useMutation({
    mutationFn: inspectionRequirementExport,
    onSuccess,
  });
};
