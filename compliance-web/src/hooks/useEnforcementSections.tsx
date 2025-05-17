import { EnforcementSection } from "@/models/EnforcementSection";
import { request } from "@/utils/axiosUtils";
import { useStaticQuery } from "./useCustomQueries";

const fetchEnforcementSections = (): Promise<EnforcementSection[]> => {
  return request({ url: "/sections" });
};

export const useEnforcementSectionsData = () => {
  return useStaticQuery({
    queryKey: ["enforcement-sections"],
    queryFn: fetchEnforcementSections,
  });
};
