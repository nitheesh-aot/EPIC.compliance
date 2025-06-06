import { ApprovalStatus } from "./ApprovalStatus";
import { StaffUser } from "./Staff";

export interface WarningLetterApproval {
  approved_by: StaffUser;
  approval_status: ApprovalStatus;
  id: number;
  warning_letter_id: number;
  approved_by_id: number;
}
