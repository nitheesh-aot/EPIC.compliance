import { useQuery } from "@tanstack/react-query";
import { request } from "@/utils/axiosUtils";
import { Agency } from "@/models/Agency";

const fetchAgencies = (): Promise<Agency[]> => {
  return request({ url: "/agencies" });
};

export const useAgenciesData = () => {
  return useQuery({
    queryKey: ["agencies"],
    queryFn: fetchAgencies,
  });
};
