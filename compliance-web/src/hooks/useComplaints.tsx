import { Complaint, ComplaintAPIData } from "@/models/Complaint";
import { ComplaintSource } from "@/models/ComplaintSource";
import { RequirementSource } from "@/models/RequirementSource";
import { OnSuccessType, request } from "@/utils/axiosUtils";
import { useMutation, useQuery } from "@tanstack/react-query";

const fetchRequirementSources = (): Promise<RequirementSource[]> => {
  return request({ url: "/requirement-sources" });
};

const fetchComplaintSources = (): Promise<ComplaintSource[]> => {
  return request({ url: "/complaints/sources" });
};

const fetchComplaints = (caseFileId?: number): Promise<Complaint[]> => {
  return request({ url: "/complaints", params: { case_file_id: caseFileId } });
};

const createComplaint = (complaint: ComplaintAPIData) => {
  return request({ url: "/complaints", method: "post", data: complaint });
};

export const useRequirementSourcesData = () => {
  return useQuery({
    queryKey: ["requirement-sources"],
    queryFn: fetchRequirementSources,
  });
};

export const useComplaintSourcesData = () => {
  return useQuery({
    queryKey: ["complaint-sources"],
    queryFn: fetchComplaintSources,
  });
};

export const useComplaintsData = () => {
  return useQuery({
    queryKey: ["complaints"],
    queryFn: () => fetchComplaints(),
  });
};

export const useComplaintsByCaseFileId = (caseFileId: number) => {
  return useQuery({
    queryKey: ["complaints-by-caseFileId", caseFileId],
    queryFn: () => fetchComplaints(caseFileId),
    enabled: !!caseFileId,
  });
};

export const useCreateComplaint = (onSuccess: OnSuccessType) => {
  return useMutation({ mutationFn: createComplaint, onSuccess });
};
