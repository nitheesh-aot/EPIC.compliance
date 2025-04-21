import { StaffUser } from "./Staff";

export interface IRApproval {
  approved_by: StaffUser;
  approval_status: string;
  id: number;
  inspection_record_id: number;
  date_report_sent: string;
  date_expected_return: string;
  date_response: string;
  response_provided: boolean;
  approved_by_id: number;
  ir_status_id: number;
  approved_date: string;
  is_active: boolean;
}

export interface InspectionRecordApprovalPayload {
  field_name: string;
  value: string | null;
}
