import { request } from "@/utils/axiosUtils";
import {
  InspectionRequirementGridItems,
  InspectionRequirementGridQueryParams,
} from "@/models/InspectionRequirementGrid";
import { useQuery } from "@tanstack/react-query";

const fetchInspectionRequirementsGrid = (
  queryParams: InspectionRequirementGridQueryParams
): Promise<InspectionRequirementGridItems> => {
  return request({ url: "/inspection-requirements", params: queryParams });
};

export const useInspectionRequirementsGrid = () => {
  return useQuery({
    queryKey: ["inspection-requirements-grid"],
    queryFn: () => fetchInspectionRequirementsGrid({}),
  });
};
