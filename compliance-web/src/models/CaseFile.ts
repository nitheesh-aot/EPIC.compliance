import { Dayjs } from "dayjs";
import { Initiation } from "./Initiation";
import { Project } from "./Project";
import { StaffUser } from "./Staff";

export interface CaseFile {
  id: number;
  project_id: number;
  date_created: string;
  lead_officer_id: number;
  case_file_number: string;
  case_file_status: string;
  initiation: Initiation;
  is_active: boolean;
  project: Project;
  lead_officer: StaffUser;
  officers?: StaffUser[];
}

export interface CaseFileFormData {
  project?: Project;
  dateCreated?: Dayjs;
  leadOfficer?: StaffUser;
  officers?: StaffUser[];
  initiation?: Initiation;
  caseFileNumber?: string;
}

export interface CaseFileAPIData {
  project_id?: number;
  date_created: string;
  lead_officer_id?: number;
  officer_ids?: number[];
  initiation_id?: string;
  case_file_number?: string;
}
