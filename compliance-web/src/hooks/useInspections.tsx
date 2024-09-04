import { InspectionAPIData } from "@/models/Inspection";
import { IRType } from "@/models/IRType";
import { OnErrorType, OnSuccessType, request } from "@/utils/axiosUtils";
import { useMutation, useQuery } from "@tanstack/react-query";


const fetchIRTypes = (): Promise<IRType[]> => {
  return request({ url: "/inspections/ir-type-options" });
};

const createInspection = (inspection: InspectionAPIData) => {
  return request({ url: "/inspections", method: "post", data: inspection });
};

export const useIRTypesData = () => {
  return useQuery({
    queryKey: ["ir-types"],
    queryFn: fetchIRTypes,
  });
};

export const useCreateInspection = (
  onSuccess: OnSuccessType,
  onError: OnErrorType
) => {
  return useMutation({
    mutationFn: createInspection,
    onSuccess,
    onError,
  });
};
