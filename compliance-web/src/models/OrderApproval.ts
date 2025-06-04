import { ApprovalStatus } from "./ApprovalStatus";
import { StaffUser } from "./Staff";
import { OrderStatus } from "./InspectionOrder";

export interface OrderApproval {
  approved_by: StaffUser;
  approval_status: ApprovalStatus;
  id: number;
  order_id: number;
  order_status: OrderStatus;
  approved_by_id: number;
}
