import { RequirementDocumentType } from "./RequirementDocumentType";
import { IRStatus } from "./IRStatus";
import { IRType } from "./IRType";
import { RequirementSource } from "./RequirementSource";
import { Topic } from "./Topic";


export interface InspectionRequirementFormData {
  requirementSummary?: string;
  topic?: Topic;
  complianceFinding?: IRType;
  enforcementAction?: IRStatus[];
  findings?: {
    html: string;
    text: string;
  }
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
}

export interface RequirementRelatedDocumentFormData {
  id?: number;
  requirementSource?: RequirementSource;
  condition?: string;
  relatedDocument?: RequirementDocumentType;
  documentTitle?: string;
  sectionNumber?: string;
  sectionTitle?: string;
  description?: {
    html: string;
    text: string;
  };
}
