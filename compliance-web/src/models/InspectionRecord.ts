import { Inspection } from "./Inspection";
import { IRProgress } from "./IRProgress";
import { IRStatus } from "./IRStatus";

export interface InspectionRecord {
  id?: number;
  inspection_id?: number;
  inspection?: Inspection;
  action_required_by_rp?: string;
  date_issued?: string;
  enforcement_summary?: string;
  finding_statement?: string;
  inspection_scope?: string;
  intended_issuance_date?: string;
  ir_progress?: IRProgress;
  ir_status_id?: number;
  ir_status?: IRStatus;
  is_active?: boolean;
  mailing_address?: string;
  preliminary_review_details?: string;
  field_change_info?: {
    inspection_scope_changed?: boolean;
    finding_statement_changed?: boolean;
    preliminary_review_details_changed?: boolean;
  };
}
