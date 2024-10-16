import { CaseFile, CaseFileAPIData } from "@/models/CaseFile";
import { Initiation } from "@/models/Initiation";
import { StaffUser } from "@/models/Staff";
import { OnSuccessType, request } from "@/utils/axiosUtils";
import { useMutation, useQuery } from "@tanstack/react-query";

const fetchCaseFiles = (projectId?: number): Promise<CaseFile[]> => {
  return request({ url: "/case-files", params: { project_id: projectId } });
};

const fetchCaseFile = (caseFileNumber: string): Promise<CaseFile> => {
  return request({ url: `/case-files/case-file-numbers/${caseFileNumber}`});
};

const fetchOfficers = (caseFileId: number): Promise<StaffUser[]> => {
  return request({ url: `/case-files/${caseFileId}/officers`});
};

const fetchInitiations = (): Promise<Initiation[]> => {
  return request({ url: "/case-files/initiation-options" });
};

const createCaseFile = (caseFile: CaseFileAPIData) => {
  return request({ url: "/case-files", method: "post", data: caseFile });
};

export const useCaseFilesData = () => {
  return useQuery({
    queryKey: ["case-files"],
    queryFn: () => fetchCaseFiles(),
  });
};

export const useCaseFileByNumber = (caseFileNumber: string) => {
  return useQuery({
    queryKey: ["case-file", caseFileNumber],
    queryFn: () => fetchCaseFile(caseFileNumber),
    enabled: !!caseFileNumber
  });
};

export const useOfficersByCaseFileId = (caseFileId: number) => {
  return useQuery({
    queryKey: ["officers", caseFileId],
    queryFn: () => fetchOfficers(caseFileId),
    enabled: !!caseFileId
  });
};

export const useCaseFilesByProjectId = (projectId: number) => {
  return useQuery({
    queryKey: ["case-files-by-projectId", projectId],
    queryFn: () => fetchCaseFiles(projectId),
    enabled: !!projectId,
  });
};

export const useInitiationsData = () => {
  return useQuery({
    queryKey: ["case-files-initiations"],
    queryFn: fetchInitiations,
  });
};

export const useCreateCaseFile = (onSuccess: OnSuccessType) => {
  return useMutation({ mutationFn: createCaseFile, onSuccess });
};
