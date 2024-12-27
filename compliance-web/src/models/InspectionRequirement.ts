import { IRStatus } from "./IRStatus";
import { IRType } from "./IRType";
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
