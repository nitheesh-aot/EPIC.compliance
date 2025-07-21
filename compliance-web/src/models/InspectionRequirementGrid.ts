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
  tpc_ids?: string;
  summary?: string;
  cmd_fnd_ids?: string;
  enf_actn_ids?: string;
  apprv_sts?: string;
  req_src_ids?: string;
  req_src_num?: string;
  ir_no?: string;
  date_issued?: string;
  prm_offc_ids?: string;
  insp_sts?: string;
  project_ids?: string;
  page_no?: number;
  page_size?: number;
}

export interface InspectionRequirementGridItems {
  items: InspectionRequirementGrid[];
  total: number;
}
