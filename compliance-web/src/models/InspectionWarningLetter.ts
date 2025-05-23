
import { StaffUser } from "./Staff";

export interface InspectionWarningLetter {
  issuing_officer?: StaffUser;
  id?: number;
  content?: string;
  warning_letter_number?: string;
  date_issued?: string;
  intended_issuance_date?: string;
  inspection_id?: number;
  issuing_officer_id?: number;
  warning_letter_requirement_map?: WarningLetterRequirementMap[];
  is_active?: boolean;
}

interface WarningLetterRequirementMap {
  id: number;
  inspection_requirement_id: number;
  inspection_requirement: {
    id: number;
    summary: string;
  };
}

export interface InspectionWarningLetterAPIData {
  issuing_officer_id?: number;
  intended_issuance_date?: string;
  content?: string;
  inspection_requirement_ids: number[];
  warning_letter_number?: string;
}
