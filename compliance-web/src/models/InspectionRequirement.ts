import { RequirementDocumentType } from "./RequirementDocumentType";
import { IRStatus } from "./IRStatus";
import { IRType } from "./IRType";
import { RequirementSource } from "./RequirementSource";
import { Topic } from "./Topic";
import { ComplianceFinding } from "./ComplianceFinding";
import { EnforcementAction } from "./EnforcementAction";

export interface InspectionRequirement {
  id: number;
  inspection_id: number;
  summary: string;
  topic_id: number;
  topic: Topic;
  enforcement_action_id: number;
  compliance_finding_id: number;
  compliance_finding: ComplianceFinding;
  enforcement_action_data: EnforcementAction[];
  findings: string;
  sort_order: number;
  is_active: boolean;
  requirement_source_details: [
    {
      id: number,
      requirement_id: number,
      requirement_source_id: number,
      requirement_source: RequirementSource,
      section_number: string,
      condition_number: string,
      amendment_number: string,
      title: string,
      description: string,
      is_active: boolean,
      documents: [
        {
          id: number,
          req_detail_id: number,
          document_type_id: number,
          document_title: string,
          section_number: string,
          section_title: string,
          description: string,
          is_active: boolean
        }
      ],
    }
  ],
}

export interface InspectionRequirementFormData {
  requirementSummary?: string;
  topic?: Topic;
  complianceFinding?: IRType;
  enforcementAction?: IRStatus[];
  findings?: {
    html: string;
    text: string;
  };
  requirementSourceDetails?: RequirementSourceFormData[];
}

export interface RequirementSourceFormData {
  id?: number;
  requirementSource?: RequirementSource;
  sourceNumber?: string;
  sourceTitle?: string,
  sourceAmendmentNumber?: string,
  description?: {
    html: string;
    text: string;
  },
  relatedDocuments?: RequirementRelatedDocumentData[];
}

export interface RequirementRelatedDocumentData {
  id?: number;
  sourceFormId?: number;
  relatedDocument?: RequirementDocumentType;
  documentTitle?: string;
  sections?: RequirementRelatedDocumentSectionData[];
}

export interface RequirementRelatedDocumentSectionData {
  id?: number;
  sourceFormId?: number;
  relatedDocumentFormId?: number;
  sectionNumber?: string;
  sectionTitle?: string;
  description?: {
    html: string;
    text: string;
  };
}

export interface RequirementRelatedDocumentSectionFormData {
  id?: number;
  relatedDocument?: RequirementDocumentType,
  documentTitle?: string,
  sectionNumber?: string,
  sectionTitle?: string,
  description?: {
    html: string;
    text: string;
  },
}

export interface InspectionRequirementAPIData {
  inspection_id?: number,
  summary: string,
  topic_id: number,
  enforcement_action_ids: string[],
  compliance_finding_id: string,
  findings: string,
  requirement_source_details: InspectionRequirementSourceAPIData[]
}

export interface InspectionRequirementSourceAPIData {
  requirement_source_id: string,
  section_number?: string,
  condition_number?: string,
  amendment_number?: string,
  title: string,
  description: string,
  documents: InspectionRequirementSourceDocumentAPIData[]
}

export interface InspectionRequirementSourceDocumentAPIData {
  document_type_id: string,
  document_title: string,
  section_number: string,
  section_title: string,
  description: string,
}
