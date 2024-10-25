import { Complaint, ComplaintAPIData } from "@/models/Complaint";
import { ComplaintSource } from "@/models/ComplaintSource";
import { Contact } from "@/models/Contact";
import { RequirementSource } from "@/models/RequirementSource";
import { OnSuccessType, request } from "@/utils/axiosUtils";
import {
  UNAPPROVED_PROJECT_ABBREVIATION,
  UNAPPROVED_PROJECT_ID,
} from "@/utils/constants";
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

const fetchComplaint = (complaintNumber: string): Promise<Complaint> => {
  return request({ url: `/complaints/complaint-numbers/${complaintNumber}` });
};

const fetchSourceContact = (complaintId: number): Promise<Contact> => {
  return request({ url: `/complaints/${complaintId}/source-contacts` });
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

export const useComplaintByNumber = (complaintNumber: string) => {
  return useQuery({
    queryKey: ["complaint", complaintNumber],
    queryFn: async () => {
      const complaint = await fetchComplaint(complaintNumber);
      const source_contact = await fetchSourceContact(complaint?.id);
      if (complaint.project.abbreviation === UNAPPROVED_PROJECT_ABBREVIATION) {
        complaint.project.id = UNAPPROVED_PROJECT_ID;
        delete complaint.project.abbreviation;
      }
      return { ...complaint, source_contact };
    },
    enabled: !!complaintNumber,
  });
};

export const useCreateComplaint = (onSuccess: OnSuccessType) => {
  return useMutation({ mutationFn: createComplaint, onSuccess });
};
