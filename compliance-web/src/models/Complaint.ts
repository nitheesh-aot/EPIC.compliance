import { Project } from "./Project";
import { RequirementSource } from "./RequirementSource";
import { ComplaintSource } from "./ComplaintSource";
import { StaffUser } from "./Staff";
import { CaseFile } from "./CaseFile";
import { Contact } from "./Contact";
import { Topic } from "./Topic";

export interface Complaint {
  id: number;
  complaint_number: string;
  case_file_id: number;
  project_id: number;
  project_description: string;
  concern_description: string;
  location_description: string;
  lead_officer_id: number;
  date_received: string;
  requirement_source_id: number;
  source_type_id: number;
  source_agency_id: number;
  source_first_nation_id: number;
  is_active: boolean;
  case_file: CaseFile;
  lead_officer: StaffUser;
  project: Project;
  source_type: ComplaintSource;
  requirement_source: RequirementSource;
  source_contact: Contact;
  requirement_detail: {
    topic: Topic;
  };
  status: string;
  authorization?: string;
  regulated_party?: string;
  type?: string;
  sub_type?: string;
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
  source_type_id: string;
  complaint_source_contact?: Contact;
  source_agency_id?: number;
  source_first_nation_id?: number;
  requirement_source_id?: string;
  requirement_source_details?: {
    topic_id?: number;
    description?: string;
    order_number?: string;
    amendment_number?: string;
    amendment_condition_number?: string;
    condition_number?: string;
  };
  project_description?: string;
  unapproved_project_authorization?: string;
  unapproved_project_regulated_party?: string;
  unapproved_project_type?: string;
  unapproved_project_sub_type?: string;
}
