import { Project } from "./Project";
import { RequirementSource } from "./RequirementSource";
import { ComplaintSource } from "./ComplaintSource";
import { StaffUser } from "./Staff";

export interface Complaint {
  id: number;
  case_file_id: number;
  project_id: number;
  concern_description: string;
  location_description: string;
  lead_officer_id: number;
  date_received: string;
  requirement_source_id: number;
  source_id: number;
  is_active: boolean;
}

export interface InspectionFormData {
  project?: Project;
  dateRecieved?: Date;
  leadOfficer?: StaffUser;
  concernDescription?: string;
  locationDescription?: string;
  complaintSource: ComplaintSource;
  requirementSource?: RequirementSource;
  caseFileId?: string;
}

export interface ComplaintAPIData {
  project_id?: number;
  concern_description: string;
  location_description?: string;
  lead_officer_id?: number;
  case_file_id: number;
  date_received: string;
  complaint_source_id: string;
  requirement_source_id?: string;
  project_description?: string;
  unapproved_project_authorization?: string;
  unapproved_project_regulated_party?: string;
  unapproved_project_type?: string;
  unapproved_project_sub_type?: string;
}
