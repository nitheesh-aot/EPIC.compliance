import { ContinuationReportAPIData } from "@/models/ContinuationReport";
import { OnSuccessType, request } from "@/utils/axiosUtils";
import { useMutation } from "@tanstack/react-query";

const createContinuationReportEntry = (caseFile: ContinuationReportAPIData) => {
  return request({ url: "/continuation-reports", method: "post", data: caseFile });
};

export const useCreateContinuationReportEntry = (onSuccess: OnSuccessType) => {
  return useMutation({ mutationFn: createContinuationReportEntry, onSuccess });
};
