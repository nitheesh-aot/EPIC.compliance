import { DateRange } from "./DateRange";
import { Initiation } from "./Initiation";
import { Project } from "./Project";
import { StaffUser } from "./Staff";

export interface Inspection {
  id: number;
  project_id: number;
  date_created: string;
  lead_officer_id: number;
  case_file_number: string;
  initiation: Initiation;
  is_active: boolean;
  project: Project;
  lead_officer: StaffUser;
}

export interface InspectionFormData {
  project?: Project;
  dateRange?: DateRange;
  leadOfficer?: StaffUser;
  officers?: StaffUser[];
  initiation?: Initiation;
  caseFileNumber?: string;
}

export interface InspectionAPIData {
  project_id: number;
  location_description?: string;
  utm?: string;
  lead_officer_id: number;
  case_file_id: number;
  ir_type_id: string;
  start_date: string;
  end_date: string;
  initiation_id: string;
  ir_status_id?: number;
  project_status_id?: number;
  inspection_officer_ids?: number[];
  attendance_option_ids?: number[];
  agency_attendance_ids?: number[];
  attendance_municipal?: string;
  attendance_other?: string;
  firstnation_attendance_ids?: number[];
  unapproved_project_description?: string;
  unapproved_project_authorization?: string;
  unapproved_project_proponent_name?: string;
}
