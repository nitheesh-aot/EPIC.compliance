import { Agency } from "./Agency";
import { ComplianceFinding } from "./ComplianceFinding";
import { EnforcementAction } from "./EnforcementAction";
import { InspectionRequirementType } from "./InspectionRequirementType";
import { Topic } from "./Topic";
import { RequirementImage } from "./Image";
import { InspectionRequirementSource, InspectionRequirementSourceAPIData, RequirementSourceFormData } from "./InspectionRequirementSource";

export interface InspectionRequirement {
  id: number;
  req_type: InspectionRequirementType;
  inspection_id: number;
  summary: string;
  topic_id: number;
  topic: Topic;
  agency_id: number;
  agency: Agency;
  enforcement_action_id: number;
  compliance_finding_id: number;
  compliance_finding: ComplianceFinding;
  enforcement_action_data: EnforcementAction[];
  findings: string;
  sort_order: number;
  is_active: boolean;
  requirement_source_details: InspectionRequirementSource[];
}

export interface InspectionRequirementFormData {
  requirementType?: InspectionRequirementType;
  id?: number;
  requirementSummary?: string;
  topic?: Topic;
  complianceFinding?: ComplianceFinding;
  enforcementAction?: EnforcementAction;
  isReferralToAdministrativePenalty?: boolean;
  agency?: Agency;
  isReferredToAnotherAgency?: boolean;
  findings?: {
    html: string;
    text: string;
  };
  requirementSourceDetails?: RequirementSourceFormData[];
}

export interface InspectionRequirementAPIData {
  id?: number,
  req_type: string,
  summary: string,
  topic_id: number,
  agency_id?: number,
  enforcement_action_ids?: string[],
  compliance_finding_id?: string,
  findings: string,
  requirement_source_details?: InspectionRequirementSourceAPIData[],
  photos?: RequirementImage[],
  figures?: RequirementImage[],
}

export interface InspectionRequirementBatchAPIData {
  requirement_id: number,
  findings: string,
  images: InspectionRequirementBatchImageAPIData[]
}

export interface InspectionRequirementBatchImageAPIData {
  image_id: number,
  sort_order: number
}
