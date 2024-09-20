import { Agency } from "@/models/Agency";
import { ComplaintAPIData } from "@/models/Complaint";
import { ComplaintSource } from "@/models/ComplaintSource";
import { FirstNation } from "@/models/FirstNation";
import { Project } from "@/models/Project";
import { RequirementSource } from "@/models/RequirementSource";
import { StaffUser } from "@/models/Staff";
import {
  REGEX_EMAIL,
  REGEX_PHONE_NUMBER,
  UNAPPROVED_PROJECT_ID,
} from "@/utils/constants";
import dateUtils from "@/utils/dateUtils";
import * as yup from "yup";

export enum ComplaintSourceEnum {
  FIRST_NATION = "2",
  AGENCY = "3",
  OTHER = "4",
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
  contactFullName: yup.string().nullable(),
  contactEmail: yup
    .string()
    .nullable()
    .test(
      "is-valid-email",
      "Invalid email format",
      (value) => !value || REGEX_EMAIL.test(value) // Only validate if value is not empty
    ),
  contactPhoneNumber: yup
    .string()
    .nullable()
    .test(
      "is-valid-phone",
      "Invalid phone number format",
      (value) => !value || REGEX_PHONE_NUMBER.test(value) // Only validate if value is not empty
    ),
  contactComments: yup.string().nullable(),
  agency: yup.object<Agency>().when("complaintSource", {
    is: (attendance: ComplaintSource) =>
      attendance?.id === ComplaintSourceEnum.AGENCY,
    then: (schema) => schema.required("Agency is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  firstNation: yup.object<FirstNation>().when("complaintSource", {
    is: (attendance: ComplaintSource) =>
      attendance?.id === ComplaintSourceEnum.FIRST_NATION,
    then: (schema) => schema.required("First Nation is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  otherDescription: yup.string().when("complaintSource", {
    is: (attendance: ComplaintSource) =>
      attendance?.id === ComplaintSourceEnum.OTHER,
    then: (schema) => schema.required("Description is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
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
