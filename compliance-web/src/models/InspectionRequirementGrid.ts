import { ComplianceFinding } from "./ComplianceFinding";
import { EnforcementAction } from "./EnforcementAction";
import { ApprovalStatus } from "./ApprovalStatus";
import { RequirementSource } from "./RequirementSource";
import { Topic } from "./Topic";

export interface InspectionRequirementGrid {
  id: number;
  topic: Topic;
  summary: string;
  compliance_finding: ComplianceFinding;
  enforcement_action: EnforcementAction;
  approval_status: ApprovalStatus;
  sort_order: number;
  date_issued: string;
  ir_number: string;
  requirement_number: string;
  requirement_source: RequirementSource;
}

export interface InspectionRequirementGridQueryParams {
  topic_id?: number;
  summary?: string;
  compliance_finding_id?: number;
  enforcement_action_id?: number;
  approval_status?: string;
  requirement_source_id?: number;
  ir_number?: string;
  date_issued?: string;
  primary_officer_id?: number;
  inspection_status?: string;
  project_id?: number;
  page?: number;
  per_page?: number;
}

export interface InspectionRequirementGridItems {
  items: InspectionRequirementGrid[];
  total: number;
}
