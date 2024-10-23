import { Complaint, ComplaintAPIData } from "@/models/Complaint";
import { ComplaintSource } from "@/models/ComplaintSource";
import { RequirementSource } from "@/models/RequirementSource";
import { OnSuccessType, request } from "@/utils/axiosUtils";
import { UNAPPROVED_PROJECT_ABBREVIATION, UNAPPROVED_PROJECT_ID } from "@/utils/constants";
import { useMutation, useQuery } from "@tanstack/react-query";

const fetchRequirementSources = (): Promise<RequirementSource[]> => {
  return request({ url: "/requirement-sources" });
};

const fetchComplaintSources = (): Promise<ComplaintSource[]> => {
  return request({ url: "/complaints/sources" });
};

const fetchComplaints = (): Promise<Complaint[]> => {
  return request({ url: "/complaints" });
};

const fetchComplaint = (complaintNumber: string): Promise<Complaint> => {
  return request({ url: `/complaints/${complaintNumber}` });
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
    queryFn: fetchComplaints,
  });
};

export const useComplaintByNumber = (complaintNumber: string) => {
  return useQuery({
    queryKey: ["complaint", complaintNumber],
    queryFn: async () => {
      const complaint = await fetchComplaint(complaintNumber);
      if (complaint.project.abbreviation === UNAPPROVED_PROJECT_ABBREVIATION) {
        complaint.project.id = UNAPPROVED_PROJECT_ID;
        delete complaint.project.abbreviation;
      }
      return complaint;
    },
    enabled: !!complaintNumber,
  });
};

export const useCreateComplaint = (onSuccess: OnSuccessType) => {
  return useMutation({ mutationFn: createComplaint, onSuccess });
};
