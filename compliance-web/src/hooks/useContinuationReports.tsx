import { ContinuationReport, ContinuationReportAPIData } from "@/models/ContinuationReport";
import { OnSuccessType, request } from "@/utils/axiosUtils";
import { useMutation, useQuery } from "@tanstack/react-query";

const fetchContinuationReportEntries = (caseFileId: number): Promise<ContinuationReport[]> => {
  return request({ url: "/continuation-reports", params: { case_file_id: caseFileId } });
};

const createContinuationReportEntry = (caseFile: ContinuationReportAPIData) => {
  return request({ url: "/continuation-reports", method: "post", data: caseFile });
};

export const useCreateContinuationReportEntry = (onSuccess: OnSuccessType) => {
  return useMutation({ mutationFn: createContinuationReportEntry, onSuccess });
};

export const useContinuationReportEntries = (caseFileId: number) => {
  return useQuery({
    queryKey: ["continuation-reports", caseFileId],
    queryFn: () => fetchContinuationReportEntries(caseFileId),
  });
};
