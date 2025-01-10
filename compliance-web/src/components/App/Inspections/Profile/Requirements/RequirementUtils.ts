import { Topic } from "@/models/Topic";
import { ComplianceFinding } from "@/models/ComplianceFinding";
import { EnforcementAction } from "@/models/EnforcementAction";
import * as yup from "yup";
import { RequirementSourceEnum } from "@/utils/constants";
import { InspectionRequirementFormData } from "@/models/InspectionRequirement";
import { InspectionRequirementAPIData, InspectionRequirementSourceAPIData, InspectionRequirementSourceDocumentAPIData, RequirementSourceFormData } from "@/models/InspectionRequirement";

export const RequirementFormSchema = yup.object().shape({
  requirementSummary: yup.string().required("Summary is required"),
  topic: yup.object<Topic>().nullable().required("Topic is required"),
  complianceFinding: yup.object<ComplianceFinding>().nullable(),
  enforcementAction: yup.array().of(yup.object<EnforcementAction>()).nullable(),
  findings: yup
    .object({
      html: yup.string(),
      text: yup.string(),
    })
    .nullable(),
});

export type RequirementSchemaType = yup.InferType<typeof RequirementFormSchema>;

// Check if the RequirementSource got condition
export const isRequirementSourceCondition = (id: string): boolean =>
  [
    RequirementSourceEnum.SCHEDULE_B,
    RequirementSourceEnum.EAC,
    RequirementSourceEnum.EACA,
  ].includes(id as RequirementSourceEnum);


export const formatRequirementAPIData = (
  inspectionId: number,
  formData: InspectionRequirementFormData,
  requirementSourceList: RequirementSourceFormData[]
): InspectionRequirementAPIData => {

  const requirementSourceDetails: InspectionRequirementSourceAPIData[] =
    requirementSourceList.map((item) => {
      const requirementSource: InspectionRequirementSourceAPIData = {
        requirement_source_id: item.requirementSource?.id ?? "",
        amendment_number: item.sourceAmendmentNumber ?? "",
        title: item.sourceTitle ?? "",
        description: item.description?.html ?? "",
        documents: [],
      };
      if (isRequirementSourceCondition(item.requirementSource?.id ?? "")) {
        requirementSource.condition_number = item.sourceNumber ?? "";
      } else {
        requirementSource.section_number = item.sourceNumber ?? "";
      }
      item.relatedDocuments?.forEach((document) => {
        document.sections?.forEach((section) => {
          const srcDocument: InspectionRequirementSourceDocumentAPIData = {
            document_type_id: document.relatedDocument?.id ?? "",
            document_title: document.documentTitle ?? "",
            section_number: section.sectionNumber ?? "",
            section_title: section.sectionTitle ?? "",
          };
          requirementSource.documents.push(srcDocument);
        });
      });
      return requirementSource;
    });

  const inspectionRequirementPayload: InspectionRequirementAPIData = {
    inspection_id: inspectionId,
    summary: formData.requirementSummary ?? "",
    topic_id: formData.topic?.id ?? 0,
    enforcement_action_id: formData.enforcementAction?.[0]?.id ?? "",
    compliance_finding_id: formData.complianceFinding?.id ?? "",
    findings: formData.findings?.html ?? "",
    sort_order: 0,
    requirement_source_details: requirementSourceDetails,
  };

  return inspectionRequirementPayload;
};
