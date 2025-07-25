import { InspectionRequirement } from "@/models/InspectionRequirement";
import { EnforcementActionEnum } from "@/utils/constants";
import * as yup from "yup";


// Base schema for all enforcement types
export const baseEnforcementSchema = yup.object().shape({
  requirements: yup
    .array()
    .of(yup.object<InspectionRequirement>())
    .nullable()
    .min(1, "At least one Requirement is required")
    .required("Requirement is required"),
});

export type BaseEnforcementFormType = yup.InferType<typeof baseEnforcementSchema>;

export const initBaseFormData: BaseEnforcementFormType = {
  requirements: [],
};


export const prepNonProceededRequirements = (
  {
    requirements,
    reqIds,
    enforcementActionType
  } : {
    requirements: InspectionRequirement[],
    reqIds: (number[] | undefined)[] | undefined,
    enforcementActionType: EnforcementActionEnum
  }
) => {
  const flattenedReqIds = reqIds?.flat() || [];
  const nonProceededRequirements = requirements.filter(
    (requirement) =>
      !flattenedReqIds.includes(requirement.id) &&
      requirement.enforcement_action_data?.some(
        (enforcement) => enforcement.id === enforcementActionType
      )
  );
  return nonProceededRequirements;
};
