import { Agency } from "@/models/Agency";
import { ComplianceFinding } from "@/models/ComplianceFinding";
import { EnforcementAction } from "@/models/EnforcementAction";
import { InspectionRequirement, InspectionRequirementAPIData, InspectionRequirementBatchAPIData, InspectionRequirementBatchImageAPIData, InspectionRequirementFormData, InspectionRequirementSourceAPIData, InspectionRequirementSourceDocumentAPIData, RequirementRelatedDocumentData, RequirementRelatedDocumentSectionData, RequirementSourceFormData } from "@/models/InspectionRequirement";
import { Topic } from "@/models/Topic";
import { RequirementSourceEnum } from "@/utils/constants";
import * as yup from "yup";
import { RequirementImage, ImageAPIData } from "@/models/Image";
import dateUtils from "@/utils/dateUtils";
import { MentionData } from "@/components/Shared/LexicalEditor/LexicalUtils";
import { BCDesignTokens } from "epic.theme";
import { mergeMapsWithArrayConcat } from "@/utils/appUtils";

export const REQUIREMENT_TYPE_ID = "REQ";
export const REGULATORY_CONSIDERATION_TYPE_ID = "REG";

export enum EnforcementActionEnum {
  NOT_APPLICABLE = "2",
  ORDER = "5",
  REFERRAL_TO_ADMINISTRATIVE_PENALTY = "6",
  REFER_TO_ANOTHER_AGENCY = "7",
}

export enum ComplianceFindingEnum {
  IN = "1",
}

export enum ImageTypeEnum {
  PHOTO,
  FIGURE,
}

export const requirementCardStyles = {
  card: {
    backgroundColor: BCDesignTokens.surfaceColorBackgroundWhite,
    mb: 2,
    border: `1px solid ${BCDesignTokens.surfaceColorBorderDefault}`,
    borderRadius: BCDesignTokens.layoutBorderRadiusMedium,
    "&:hover": {
      cursor: "pointer",
      boxShadow: `0px 4px 6px 0px ${BCDesignTokens.surfaceColorBorderDefault}`,
    },
  },
  header: {
    display: "flex",
    alignItems: "center",
    p: "0.75rem 1.5rem",
    pl: 0,
    backgroundColor: BCDesignTokens.surfaceColorBackgroundLightGray,
  },
  content: {
    p: "0.5rem 1.5rem 1rem",
  },
};

export const RequirementFormSchema = (isRegulatoryConsideration: boolean) => yup.object().shape({
  requirementSummary: yup.string().required("Summary is required"),
  topic: yup.object<Topic>().nullable().required("Topic is required"),
  complianceFinding: yup.object<ComplianceFinding>().nullable(),
  enforcementAction: yup.object<EnforcementAction>().nullable(),
  isReferralToAdministrativePenalty: yup.boolean().nullable(),
  isReferredToAnotherAgency: isRegulatoryConsideration ? yup.boolean().nullable() : yup.boolean().strip(),
  agency: yup.object<Agency>().nullable().when(['isReferredToAnotherAgency', 'enforcementAction'], {
    is: (isReferred: boolean, enforcementAction: EnforcementAction) =>
      (isRegulatoryConsideration && isReferred) ||
      (!isRegulatoryConsideration && enforcementAction?.id === EnforcementActionEnum.REFER_TO_ANOTHER_AGENCY),
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

// Check if the RequirementSource got condition
export const isRequirementSourceCondition = (id: string): boolean =>
  [
    RequirementSourceEnum.SCHEDULE_B,
    RequirementSourceEnum.EAC,
    RequirementSourceEnum.EACA,
  ].includes(id as RequirementSourceEnum);


export const formatRequirementAPIData = (
  formData: InspectionRequirementFormData,
  reqType: string,
  photos?: RequirementImage[],
  figures?: RequirementImage[],
  requirementSourceList?: RequirementSourceFormData[],
): InspectionRequirementAPIData => {

  const inspectionRequirementPayload: InspectionRequirementAPIData = {
    req_type: reqType,
    summary: formData.requirementSummary ?? "",
    topic_id: formData.topic?.id ?? 0,
    agency_id: formData.agency?.id ?? undefined,
    findings: formData.findings?.html ?? "",
    photos: formatImages(photos ?? []),
    figures: formatImages(figures ?? []),
  };

  if (reqType === REQUIREMENT_TYPE_ID) {
    inspectionRequirementPayload.enforcement_action_ids = formData.enforcementAction?.id ? [formData.enforcementAction.id] : [];
    inspectionRequirementPayload.compliance_finding_id = formData.complianceFinding?.id ?? undefined;

    if (formData.enforcementAction?.id === EnforcementActionEnum.ORDER && formData.isReferralToAdministrativePenalty) {
      inspectionRequirementPayload.enforcement_action_ids?.push(EnforcementActionEnum.REFERRAL_TO_ADMINISTRATIVE_PENALTY);
    }

    const requirementSourceDetails: InspectionRequirementSourceAPIData[] =
      (requirementSourceList ?? []).map((item) => {
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

    inspectionRequirementPayload.requirement_source_details = requirementSourceDetails;
  }

  return inspectionRequirementPayload;
};

const formatImages = (images: RequirementImage[]): ImageAPIData[] => {
  return images.map((image) => {
    return {
      id: image.dbId ?? undefined,
      original_file_name: image.original_file_name,
      date_taken: image.date_taken ? dateUtils.dateToISO(new Date(image.date_taken)) : undefined,
      taken_by_id: image.taken_by_id,
      caption: image.caption,
      relative_url: image.relative_url,
      sort_order: image.sort_order,
    };
  });
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

export const formatImagesToMentionList = (images: RequirementImage[]): MentionData[] => {
  return images.map((image) => ({
    id: image.id ?? 0,
    name: `${image.image_type ?? ""} ${image.sort_order}`,
    imageRelativeUrl: image.relative_url ?? "",
  }));
};

/**
 * Groups requirement source form data by requirement source ID
 * @param requirementSourceFormData Array of requirement source form data
 * @returns A Map with requirement source IDs as keys and arrays of related form data as values
 */
export const groupRequirementSourcesByType = (
  requirementSourceFormData: RequirementSourceFormData[]
): Map<string, RequirementSourceFormData[]> => {
  return requirementSourceFormData.reduce(
    (acc, item) => {
      const sourceId = item.requirementSource?.id;
      if (sourceId === undefined) {
        return acc;
      }
      if (!acc.has(sourceId)) {
        acc.set(sourceId, []);
      }
      acc.get(sourceId)!.push(item);
      return acc;
    },
    new Map<string, RequirementSourceFormData[]>()
  );
};


export const formatRequirementBatchAPIData = (
  requirements: InspectionRequirement[],
  requirementPhotos: Map<number, RequirementImage[]>,
  requirementFigures: Map<number, RequirementImage[]>,
  currentRequirementId?: number
): InspectionRequirementBatchAPIData[] => {
  // prepare batch update data for all requirements
  // if currentRequirementId is provided, the current requirement should be updated separately
  const requirementsList = currentRequirementId ?
    requirements.filter((requirement) => requirement.id !== currentRequirementId) : requirements;

  return requirementsList
    .map((requirement) => {
      const photos = requirementPhotos.get(requirement.id) ?? [];
      const figures = requirementFigures.get(requirement.id) ?? [];
      const images: InspectionRequirementBatchImageAPIData[] = [...photos, ...figures].map((image) => {
        return {
          image_id: image.id ?? 0,
          sort_order: image.sort_order ?? 0,
        };
      });
      return {
        requirement_id: requirement.id,
        findings: requirement.findings,
        images: images,
      };
    });
};

export const updateImagesWithContinuousSortOrder = (
  requirementImages: Map<number, RequirementImage[]>,
  requirementList: InspectionRequirement[],
): Map<number, RequirementImage[]> => {
  const updatedImagesWithSortOrder = new Map<number, RequirementImage[]>();
  const createNewReqEntry = requirementImages.get(NaN);

  // Group requirements by type
  const regularRequirements = requirementList.filter(req => req.req_type.id !== REGULATORY_CONSIDERATION_TYPE_ID);
  const regulatoryConsiderations = requirementList.filter(req => req.req_type.id === REGULATORY_CONSIDERATION_TYPE_ID);

  // Helper function to copy and add images to the map
  const addToMap = (requirement: InspectionRequirement) => {
    const images = requirementImages.get(requirement.id);
    if (images && images.length > 0) {
      updatedImagesWithSortOrder.set(
        requirement.id,
        images.map(image => ({ ...image }))
      );
    }
  };

  // Add requirements in desired order
  regularRequirements.forEach(addToMap);

  // Add createNewReqEntry (NaN entry) if it exists
  if (createNewReqEntry && createNewReqEntry.length > 0) {
    updatedImagesWithSortOrder.set(NaN, createNewReqEntry.map(image => ({ ...image })));
  }

  // Add regulatory considerations last
  regulatoryConsiderations.forEach(addToMap);

  // Assign continuous sort order
  let sortOrder = 1;
  updatedImagesWithSortOrder.forEach(images => {
    images.forEach(image => {
      image.sort_order = sortOrder++;
    });
  });

  return updatedImagesWithSortOrder;
}

export const formatRequirementImagesInFindings = (
  requirementsList: InspectionRequirement[],
  requirementImagesType1: Map<number, RequirementImage[]>,
  requirementImagesType2: Map<number, RequirementImage[]>
): InspectionRequirement[] => {
  const requirementImages = mergeMapsWithArrayConcat(requirementImagesType1, requirementImagesType2);

  return requirementsList.map((requirement) => {
    const { findings } = requirement;
    if (!findings || !findings.includes("data-lexical-mention="))
      return requirement;

    // Create a temporary DOM element to parse the HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = findings;

    // Find all spans with data-lexical-mention attribute
    const mentionSpans = tempDiv.querySelectorAll(
      'span[data-lexical-mention="true"]'
    );

    const imagesList = requirementImages.get(requirement.id);

    // Replace the content of each mention span with Updated Photo
    mentionSpans.forEach((span) => {
      const spanImageId = span.getAttribute("data-imageid");
      const image = imagesList?.find(
        (image) => image.id?.toString() === spanImageId
      );
      if (image) {
        const imageLabel = `${image.image_type} ${image.sort_order}`;
        span.textContent = imageLabel;
        span.setAttribute("data-mention", imageLabel);
        span.setAttribute("data-imageurl", image.relative_url ?? "");
      } else {
        span.parentNode?.removeChild(span);
      }
    });

    // Get the updated HTML
    const updatedFindings = tempDiv.innerHTML;

    return {
      ...requirement,
      findings: updatedFindings,
    };
  })
};
