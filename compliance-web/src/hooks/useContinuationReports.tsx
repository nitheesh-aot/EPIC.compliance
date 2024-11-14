import {
  ContinuationReportAPIData,
  ContinuationReportPaginated,
} from "@/models/ContinuationReport";
import { OnSuccessType, request } from "@/utils/axiosUtils";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";

const fetchContinuationReportEntries = (
  caseFileId: number,
  page: number,
  pageSize: number,
): Promise<ContinuationReportPaginated> => {
  return request({
    url: "/continuation-reports",
    params: { case_file_id: caseFileId, page_no: page, page_size: pageSize },
  });
};

const createContinuationReportEntry = (caseFile: ContinuationReportAPIData) => {
  return request({
    url: "/continuation-reports",
    method: "post",
    data: caseFile,
  });
};

export const useCreateContinuationReportEntry = (onSuccess: OnSuccessType) => {
  return useMutation({ mutationFn: createContinuationReportEntry, onSuccess });
};

export const useContinuationReportEntries = (
  caseFileId: number,
  page: number = 1,
  pageSize: number = 10,
) => {
  return useQuery({
    queryKey: ["continuation-reports", caseFileId],
    queryFn: () => fetchContinuationReportEntries(caseFileId, page, pageSize),
    placeholderData: keepPreviousData,
  });
};
