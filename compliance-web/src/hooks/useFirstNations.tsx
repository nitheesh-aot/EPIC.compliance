import { FirstNation } from "@/models/FirstNation";
import { requestTrackAPI } from "@/utils/axiosUtils";
import { useStaticQuery } from "@/hooks/useCustomQueries";

/** FETCH First Nations from TRACK API */
const fetchFirstNations = (): Promise<FirstNation[]> => {
  return requestTrackAPI({ url: "/indigenous-nations", params: { is_active: true } });
};


export const useFirstNationsData = () => {
  return useStaticQuery({
    queryKey: ["first-nations"],
    queryFn: fetchFirstNations,
  });
};
