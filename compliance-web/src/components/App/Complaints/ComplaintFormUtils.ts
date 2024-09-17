import { ComplaintAPIData } from "@/models/Complaint";
import { ComplaintSource } from "@/models/ComplaintSource";
import { Project } from "@/models/Project";
import { RequirementSource } from "@/models/RequirementSource";
import { StaffUser } from "@/models/Staff";
import { UNAPPROVED_PROJECT_ID } from "@/utils/constants";
import dateUtils from "@/utils/dateUtils";
import * as yup from "yup";

export enum AttendanceEnum {
  AGENCIES = "1",
  FIRST_NATIONS = "2",
  MUNICIPAL = "3",
  OTHER = "7",
}

export const ComplaintFormSchema = yup.object().shape({
  project: yup.object<Project>().nullable().required("Project is required"),
  authorization: yup.string().nullable(),
  certificateHolder: yup.string().nullable(),
  projectDescription: yup.string().nullable(),
  projectType: yup.string().nullable(),
  projectSubType: yup.string().nullable(),
  concernDescription: yup
    .string()
    .nullable()
    .required("Concern Description is required"),
  locationDescription: yup.string().nullable(),
  leadOfficer: yup.object<StaffUser>().nullable(),
  dateReceived: yup.date().nullable().required("Date Received is required"),
  complaintSource: yup
    .object<ComplaintSource>()
    .nullable()
    .required("Complaint Source is required"),
  requirementSource: yup.object<RequirementSource>().nullable(),
});

export type ComplaintSchemaType = yup.InferType<typeof ComplaintFormSchema>;

export const getProjectId = (formData: ComplaintSchemaType) => {
  const projectId = (formData.project as Project)?.id ?? "";
  return projectId === UNAPPROVED_PROJECT_ID ? undefined : projectId;
};

// Formatting inspection form data for API
export const formatComplaintData = (
  formData: ComplaintSchemaType,
  caseFileId: number
) => {
  const projectId = getProjectId(formData);

  let complaintData: ComplaintAPIData = {
    project_id: projectId,
    case_file_id: caseFileId,
    lead_officer_id: (formData.leadOfficer as StaffUser)?.id,
    location_description: formData.locationDescription ?? "",
    concern_description: formData.concernDescription ?? "",
    date_received: dateUtils.dateToISO(formData.dateReceived),
    complaint_source_id: (formData.leadOfficer as ComplaintSource)?.id,
    requirement_source_id: (formData.leadOfficer as RequirementSource)?.id,
  };
  if (!projectId) {
    complaintData = {
      unapproved_project_authorization: formData.authorization ?? "",
      unapproved_project_regulated_party: formData.certificateHolder ?? "",
      unapproved_project_description: formData.projectDescription ?? "",
      unapproved_project_type: formData.projectType ?? "",
      unapproved_project_sub_type: formData.projectSubType ?? "",
      ...complaintData,
    };
  }
  return complaintData;
};
