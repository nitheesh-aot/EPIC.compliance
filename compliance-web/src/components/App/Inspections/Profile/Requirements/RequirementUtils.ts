import { Agency } from "@/models/Agency";
import { ComplianceFinding } from "@/models/ComplianceFinding";
import { EnforcementAction } from "@/models/EnforcementAction";
import { InspectionRequirement, InspectionRequirementAPIData, InspectionRequirementFormData, InspectionRequirementSourceAPIData, InspectionRequirementSourceDocumentAPIData, RequirementRelatedDocumentData, RequirementRelatedDocumentSectionData, RequirementSourceFormData } from "@/models/InspectionRequirement";
import { InspectionRequirementType } from "@/models/InspectionRequirementType";
import { Topic } from "@/models/Topic";
import { RequirementSourceEnum } from "@/utils/constants";
import * as yup from "yup";

export const REQUIREMENT_TYPE_ID = "REQ";
export const REGULATORY_CONSIDERATION_TYPE_ID = "REG";

export enum EnforcementActionEnum {
  ORDER = "5",
  REFERRAL_TO_ADMINISTRATIVE_PENALTY = "6",
}

export const RequirementFormSchema = yup.object().shape({
  requirementType: yup.object<InspectionRequirementType>().nullable().required("Requirement Type is required"),
  requirementSummary: yup.string().required("Summary is required"),
  topic: yup.object<Topic>().nullable().required("Topic is required"),
  complianceFinding: yup.object<ComplianceFinding>().nullable(),
  enforcementAction: yup.object<EnforcementAction>().nullable(),
  isReferralToAdministrativePenalty: yup.boolean().nullable(),
  isReferredToAnotherAgency: yup.boolean().nullable().when('requirementType', {
    is: (requirementType: InspectionRequirementType) => requirementType?.id === REGULATORY_CONSIDERATION_TYPE_ID,
    then: (schema) => schema,
    otherwise: (schema) => schema.strip(),
  }),
  agency: yup.object<Agency>().nullable().when(['requirementType', 'isReferredToAnotherAgency'], {
    is: (requirementType: InspectionRequirementType, isReferred: boolean) =>
      requirementType?.id === REGULATORY_CONSIDERATION_TYPE_ID && isReferred,
    then: (schema) => schema.required("Agency is required"),
    otherwise: (schema) => schema.strip(),
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
    req_type: formData.requirementType?.id ?? "",
    summary: formData.requirementSummary ?? "",
    topic_id: formData.topic?.id ?? 0,
    enforcement_action_ids: formData.enforcementAction?.id ? [formData.enforcementAction.id] : [],
    compliance_finding_id: formData.complianceFinding?.id ?? undefined,
    findings: formData.findings?.html ?? "",
    requirement_source_details: requirementSourceDetails,
  };

  if (formData.enforcementAction?.id === EnforcementActionEnum.ORDER && formData.isReferralToAdministrativePenalty) {
    inspectionRequirementPayload.enforcement_action_ids?.push(EnforcementActionEnum.REFERRAL_TO_ADMINISTRATIVE_PENALTY);
  }

  return inspectionRequirementPayload;
};

export const formatRegulatoryConsiderationAPIData = (
  formData: InspectionRequirementFormData,
): InspectionRequirementAPIData => {
  const inspectionRequirementPayload: InspectionRequirementAPIData = {
    req_type: formData.requirementType?.id ?? "",
    summary: formData.requirementSummary ?? "",
    topic_id: formData.topic?.id ?? 0,
    findings: formData.findings?.html ?? "",
    agency_id: formData.agency?.id ?? undefined,
  };

  return inspectionRequirementPayload;
}

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
    requirementType: requirement.req_type,
    requirementSummary: requirement.summary,
    topic: requirement.topic,
    agency: requirement.agency,
    isReferredToAnotherAgency: !!requirement.agency_id,
    complianceFinding: requirement.compliance_finding,
    enforcementAction: requirement.enforcement_action_data[0],
    isReferralToAdministrativePenalty: requirement.enforcement_action_data.some(action => action.id === EnforcementActionEnum.REFERRAL_TO_ADMINISTRATIVE_PENALTY),
    findings: { html: requirement.findings, text: requirement.findings },
    requirementSourceDetails: requirementSourceDetails,
  };
};
