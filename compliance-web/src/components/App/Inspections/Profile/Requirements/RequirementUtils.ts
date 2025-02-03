import { Agency } from "@/models/Agency";
import { ComplianceFinding } from "@/models/ComplianceFinding";
import { EnforcementAction } from "@/models/EnforcementAction";
import { InspectionRequirement, InspectionRequirementAPIData, InspectionRequirementFormData, InspectionRequirementSourceAPIData, InspectionRequirementSourceDocumentAPIData, RequirementRelatedDocumentData, RequirementRelatedDocumentSectionData, RequirementSourceFormData } from "@/models/InspectionRequirement";
import { InspectionRequirementType } from "@/models/InspectionRequirementType";
import { Topic } from "@/models/Topic";
import { RequirementSourceEnum } from "@/utils/constants";
import * as yup from "yup";

export const RequirementFormSchema = yup.object().shape({
  requirementType: yup.object<InspectionRequirementType>().nullable().required("Requirement Type is required"),
  requirementSummary: yup.string().required("Summary is required"),
  topic: yup.object<Topic>().nullable().required("Topic is required"),
  complianceFinding: yup.object<ComplianceFinding>().nullable(),
  enforcementAction: yup.array().of(yup.object<EnforcementAction>()).nullable(),
  isReferredToAnotherAgency: yup.boolean().nullable(),
  agency: yup.object<Agency>().nullable().when("isReferredToAnotherAgency", {
    is: (isReferredToAnotherAgency: boolean) =>
      isReferredToAnotherAgency,
    then: (schema) =>
      schema
        .required("Agency is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
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
      if (item.dbId) {
        requirementSource.id = item.dbId;
      }
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
            description: section.description?.html ?? "",
          };
          if (section.dbId) {
            srcDocument.id = section.dbId;
          }
          requirementSource.documents.push(srcDocument);
        });
      });
      return requirementSource;
    });

  const inspectionRequirementPayload: InspectionRequirementAPIData = {
    summary: formData.requirementSummary ?? "",
    topic_id: formData.topic?.id ?? 0,
    enforcement_action_ids: formData.enforcementAction?.map((action) => action.id) ?? [],
    compliance_finding_id: formData.complianceFinding?.id ?? undefined,
    findings: formData.findings?.html ?? "",
    requirement_source_details: requirementSourceDetails,
  };

  return inspectionRequirementPayload;
};


export const formatRequirementFormData = (requirement: InspectionRequirement): InspectionRequirementFormData => {
  const requirementSourceDetails: RequirementSourceFormData[] = requirement?.requirement_source_details?.map((item) => {
    const relatedDocuments: RequirementRelatedDocumentData[] = [];
    item.documents.forEach((document, index) => {
      const existingDocumentIndex = relatedDocuments.findIndex(
        (doc) => doc.documentTitle === document.document_title
      );
      const docFormId = existingDocumentIndex >= 0 ? relatedDocuments[existingDocumentIndex].id : Date.now() + index;
      const section: RequirementRelatedDocumentSectionData = {
        id: document.id,
        dbId: document.id,
        sourceFormId: item.id,
        relatedDocumentFormId: docFormId,
        sectionNumber: document.section_number,
        sectionTitle: document.section_title,
        description: { html: document.description, text: document.description },
      };

      if (existingDocumentIndex >= 0) {
        relatedDocuments[existingDocumentIndex]?.sections?.push(section);
      } else {
        relatedDocuments.push({
          id: docFormId,
          relatedDocument: document.document_type,
          documentTitle: document.document_title,
          sections: [section],
        });
      }
    });
    return {
      id: item.id,
      dbId: item.id,
      requirementSource: item.requirement_source,
      sourceNumber: item.section_number ?? item.condition_number,
      sourceTitle: item.title,
      sourceAmendmentNumber: item.amendment_number,
      description: { html: item.description, text: item.description },
      relatedDocuments: relatedDocuments,
    };
  });
  return {
    id: requirement.id,
    requirementSummary: requirement.summary,
    topic: requirement.topic,
    complianceFinding: requirement.compliance_finding,
    enforcementAction: requirement.enforcement_action_data,
    findings: { html: requirement.findings, text: requirement.findings },
    requirementSourceDetails: requirementSourceDetails,
  };
};
