import { Agency } from "./Agency";
import { ComplianceFinding } from "./ComplianceFinding";
import { EnforcementAction } from "./EnforcementAction";
import { InspectionRequirementType } from "./InspectionRequirementType";
import { RequirementDocumentType } from "./RequirementDocumentType";
import { RequirementSource } from "./RequirementSource";
import { Topic } from "./Topic";
import { RequirementImage } from "./Image";
import { Appendix } from "./Appendix";
import { InspectionOrder } from "./InspectionOrder";

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
  requirement_source_details: [
    {
      id: number,
      requirement_id: number,
      requirement_source_id: number,
      requirement_source: RequirementSource,
      section_number: string,
      condition_number: string,
      amendment_number: string,
      clause_number: string,
      regulation_number: string,
      exemption_order_number: string,
      compliance_number: string,
      source_title: string,
      appendix_id: number,
      appendix: Appendix,
      order_id: number,
      order: InspectionOrder,
      title: string,
      description: string,
      is_active: boolean,
      documents: [
        {
          id: number,
          req_detail_id: number,
          document_type: RequirementDocumentType,
          document_type_id: number,
          document_title: string,
          section_number: string,
          section_title: string,
          appendix_id: number,
          appendix: Appendix,
          description: string,
          is_active: boolean
        }
      ],
    }
  ],
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

export interface RequirementSourceFormData {
  id?: number;
  dbId?: number;
  requirementSource?: RequirementSource;
  requirementSourceTitle?: string;
  regulationNumber?: string;
  exemptionOrderNumber?: string;
  complianceNumber?: string;
  amendmentNumber?: string;
  appendix?: Appendix;
  sourceNumber?: string;
  title?: string,
  order?: InspectionOrder,
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
  appendix?: Appendix;
}

export interface RequirementRelatedDocumentSectionData {
  id?: number;
  dbId?: number;
  sourceFormId?: number;
  relatedDocumentFormId?: number;
  appendix?: Appendix;
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
  appendix?: Appendix;
  documentTitle?: string,
  sectionNumber?: string,
  sectionTitle?: string,
  description?: {
    html: string;
    text: string;
  },
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

export interface InspectionRequirementSourceAPIData {
  id?: number,
  requirement_source_id: string,
  source_title?: string,
  section_number?: string,
  condition_number?: string,
  amendment_number?: string,
  regulation_number?: string,
  exemption_order_number?: string,
  compliance_number?: string,
  appendix_id?: number,
  order_id?: number,
  title: string,
  description: string,
  documents: InspectionRequirementSourceDocumentAPIData[]
}

export interface InspectionRequirementSourceDocumentAPIData {
  id?: number,
  document_type_id: string,
  document_title: string,
  section_number: string,
  section_title: string,
  description: string,
  appendix_id?: number,
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
