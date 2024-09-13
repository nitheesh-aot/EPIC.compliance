import { CaseFile } from "./CaseFile";
import { DateRange } from "./DateRange";
import { Initiation } from "./Initiation";
import { IRStatus } from "./IRStatus";
import { IRType } from "./IRType";
import { Project } from "./Project";
import { ProjectStatus } from "./ProjectStatus";
import { StaffUser } from "./Staff";

export interface Inspection {
  id: number;
  ir_number: string;
  case_file_id: number;
  project_id: number;
  location_description: string;
  utm: string;
  initiation_id: number;
  ir_status_id: number;
  project_status_id: number;
  lead_officer_id: number;
  start_date: string;
  end_date: string;
  types: string;
  inspection_status: string;
  is_active: boolean;
  initiation: Initiation;
  project: Project;
  lead_officer: StaffUser;
  ir_status: IRStatus;
  case_file: CaseFile;
}

export interface InspectionFormData {
  project?: Project;
  dateRange?: DateRange;
  leadOfficer?: StaffUser;
  officers?: StaffUser[];
  initiation?: Initiation;
  irTypes?: IRType[];
  irStatus?: IRStatus;
  projectStatus?: ProjectStatus;
  caseFileId?: string;
}

export interface InspectionAPIData {
  project_id?: number;
  location_description?: string;
  utm?: string;
  lead_officer_id: number;
  case_file_id: number;
  inspection_type_ids: string[];
  start_date: string;
  end_date: string;
  initiation_id: string;
  ir_status_id?: string;
  project_status_id?: string;
  inspection_officer_ids?: number[];
  attendance_option_ids?: string[];
  agency_attendance_ids?: number[];
  attendance_municipal?: string;
  attendance_other?: string;
  firstnation_attendance_ids?: number[];
  unapproved_project_description?: string;
  unapproved_project_authorization?: string;
  unapproved_project_proponent_name?: string;
}
