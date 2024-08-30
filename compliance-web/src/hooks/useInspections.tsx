import { IRType } from "@/models/IRType";
import { request } from "@/utils/axiosUtils";
import { useQuery } from "@tanstack/react-query";


const fetchIRTypes = (): Promise<IRType[]> => {
  return request({ url: "/inspections/ir-type-options" });
};

export const useIRTypesData = () => {
  return useQuery({
    queryKey: ["ir-types"],
    queryFn: fetchIRTypes,
  });
};
