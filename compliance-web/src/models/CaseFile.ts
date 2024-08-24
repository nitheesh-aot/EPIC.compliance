import { Initiation } from "./Initiation";
import { Project } from "./Project";
import { StaffUser } from "./Staff";

export interface CaseFile {
  id: number;
  project_id: number;
  date_created: string;
  lead_officer_id: number;
  case_file_number: number;
  is_active: boolean;
  project: Project;
  lead_officer: StaffUser;
}

export interface CaseFileFormData {
  project?: Project;
  date_created?: Date;
  lead_officer?: StaffUser;
  officers?: StaffUser[];
  initiation?: Initiation;
  case_file_number?: number;
}

export interface CaseFileAPIData {
  project_id: number;
  date_created: string;
  lead_officer_id?: number;
  officer_ids?: number[];
  initiation: string;
  case_file_number: number;
}
