import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQueryClient } from "@tanstack/react-query";
import EnforcementModal from "@/components/App/Inspections/Profile/Enforcements/EnforcementModal";
import {
  baseEnforcementSchema,
  BaseEnforcementFormType,
  getDefaultFormValues,
  ENFORCEMENT_MESSAGES,
} from "@/components/App/Inspections/Profile/Enforcements/EnforcementUtils";
import { useCreateAdministrativePenalty } from "@/hooks/useAdministrativePenalties";
import {
  AdministrativePenalty,
  AdministrativePenaltyAPIData,
} from "@/models/AdministrativePenalty";
import { Inspection } from "@/models/Inspection";
import { InspectionRequirement } from "@/models/InspectionRequirement";
import { notify } from "@/store/snackbarStore";
import { useModal } from "@/store/modalStore";
import AdministrativePenaltyUpdateModal from "./AdministrativePenaltyUpdateModal";

// Schema for AdministrativePenalty form
const administrativePenaltySchema = baseEnforcementSchema;

type AdministrativePenaltyFormType = yup.InferType<typeof administrativePenaltySchema>;



type AdministrativePenaltyCreateModalProps = {
  inspectionData: Inspection;
  requirementsList: InspectionRequirement[];
  requirement?: InspectionRequirement;
  onSubmit: (data: AdministrativePenalty) => void;
};

const AdministrativePenaltyCreateModal: FC<AdministrativePenaltyCreateModalProps> = ({
  inspectionData,
  requirementsList,
  requirement,
  onSubmit,
}) => {
  const queryClient = useQueryClient();
  const { setOpen: setModalOpen } = useModal();

  const defaultValues = useMemo(() => {
    return getDefaultFormValues(requirement, false, undefined);
  }, [requirement]);

  const methods = useForm<AdministrativePenaltyFormType>({
    resolver: yupResolver(administrativePenaltySchema),
    mode: "onBlur",
    defaultValues,
  });

  const { reset } = methods;

  useEffect(() => {
    reset(defaultValues);
  }, [reset, defaultValues]);

  const onSuccess = (data: AdministrativePenalty) => {
    queryClient.invalidateQueries({
      queryKey: ["inspection-administrative-penalties", inspectionData.id],
    });
    notify.success(ENFORCEMENT_MESSAGES.ADMINISTRATIVE_PENALTY_CREATED(data.administrative_penalty_number || ""));
    
    // Open the update modal
    setModalOpen({
      content: (
        <AdministrativePenaltyUpdateModal
          administrativePenalty={data}
          inspectionData={inspectionData}
          onSuccess={(updatedData) => {
            onSubmit(updatedData);
          }}
        />
      ),
    });
  };

  const { mutate: createAdministrativePenalty, isPending: isPendingAdministrativePenalty } =
    useCreateAdministrativePenalty(onSuccess);

  const handleBaseSubmit = useCallback(
    (data: BaseEnforcementFormType) => {
      const administrativePenaltyData: AdministrativePenaltyAPIData = {
        inspection_id: inspectionData?.id ?? 0,
        inspection_requirement_ids: (
          data.requirements as InspectionRequirement[]
        ).map((requirement) => requirement.id),
        referral_status: "DRAFTING",
      };

      createAdministrativePenalty({
        administrativePenalty: administrativePenaltyData,
      });
    },
    [createAdministrativePenalty, inspectionData]
  );

  return (
    <FormProvider {...methods}>
      <EnforcementModal
        requirementsList={requirementsList}
        requirement={requirement}
        title="Create Administrative Penalty"
        onSubmit={handleBaseSubmit}
        isLoading={isPendingAdministrativePenalty}
      />
    </FormProvider>
  );
};

export default AdministrativePenaltyCreateModal; 