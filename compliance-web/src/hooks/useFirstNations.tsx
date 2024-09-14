import { FirstNation } from "@/models/FirstNation";
import { requestTrackAPI } from "@/utils/axiosUtils";
import { useQuery } from "@tanstack/react-query";

/** FETCH First Nations from TRACK API */
const fetchFirstNations = (): Promise<FirstNation[]> => {
  return requestTrackAPI({ url: "/indigenous-nations", params: { is_active: true } });
};


export const useFirstNationsData = () => {
  return useQuery({
    queryKey: ["first-nations"],
    queryFn: fetchFirstNations,
  });
};
