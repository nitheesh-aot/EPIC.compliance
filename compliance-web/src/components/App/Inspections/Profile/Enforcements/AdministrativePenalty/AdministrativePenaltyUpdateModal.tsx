import { Box, Typography } from "@mui/material";
import { FC, useCallback, useEffect, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQueryClient } from "@tanstack/react-query";
import ModalTitleBar from "@/components/Shared/Modals/ModalTitleBar";
import ModalActions from "@/components/Shared/Modals/ModalActions";
import ControlledTextField from "@/components/Shared/Controlled/ControlledTextField";
import ControlledDateField from "@/components/Shared/Controlled/ControlledDateField";
import ControlledAutoComplete from "@/components/Shared/Controlled/ControlledAutoComplete";
import { useUpdateAdministrativePenalty, useDeleteAdministrativePenalty } from "@/hooks/useAdministrativePenalties";
import {
  AdministrativePenalty,
  AdministrativePenaltyAPIData,
} from "@/models/AdministrativePenalty";
import { Inspection } from "@/models/Inspection";
import { notify } from "@/store/snackbarStore";
import { useModal } from "@/store/modalStore";
import dayjs, { Dayjs } from "dayjs";
import { ReferralStatusEnum, APDecisionEnum } from "@/utils/constants";

// Schema for AdministrativePenalty update form
const administrativePenaltyUpdateSchema = yup.object().shape({
  referral_status: yup.mixed<ReferralStatusOption>().required("Referral Status is required"),
  date_referred: yup.mixed<Dayjs>().nullable().typeError("Invalid date"),
  decision_date: yup.mixed<Dayjs>().nullable().typeError("Invalid date"),
  decision: yup.mixed<DecisionOption>().nullable(),
  penalty_amount: yup.number().transform((value) => (isNaN(value) ? null : value)).nullable().when("decision", {
    is: (decision: DecisionOption) => decision?.id === "AP_ISSUED",
    then: (schema) => schema.required("Penalty Amount is required when AP is issued").min(0, "Penalty Amount must be positive"),
    otherwise: (schema) => schema.nullable(),
  }),
});

type AdministrativePenaltyUpdateFormType = yup.InferType<typeof administrativePenaltyUpdateSchema>;

// Referral status option type
type ReferralStatusOption = {
  id: string;
  name: string;
};

// Decision option type
type DecisionOption = {
  id: string;
  name: string;
};

// Referral status options for dropdown
const referralStatusOptions: ReferralStatusOption[] = [
  { id: "DRAFTING", name: ReferralStatusEnum.DRAFTING },
  { id: "DEPUTY_REVIEW", name: ReferralStatusEnum.DEPUTY_REVIEW },
  { id: "CEB_NOT_PROCEEDING", name: ReferralStatusEnum.CEB_NOT_PROCEEDING },
  { id: "REFERRED_TO_DM", name: ReferralStatusEnum.REFERRED_TO_DM },
];

// Decision options for dropdown
const decisionOptions: DecisionOption[] = [
  { id: "AP_ISSUED", name: APDecisionEnum.AP_ISSUED },
  { id: "AP_NOT_PROCEEDING", name: APDecisionEnum.AP_NOT_PROCEEDING },
];

type AdministrativePenaltyUpdateModalProps = {
  administrativePenalty: AdministrativePenalty;
  inspectionData: Inspection;
  onSuccess?: (data: AdministrativePenalty) => void;
};

const AdministrativePenaltyUpdateModal: FC<AdministrativePenaltyUpdateModalProps> = ({
  administrativePenalty,
  inspectionData,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const { setClose: setModalClose } = useModal();

  const defaultValues = useMemo(() => {
    const currentReferralStatus = administrativePenalty.referral_status?.value || "DRAFTING";
    const selectedReferralOption = referralStatusOptions.find(option => option.id === currentReferralStatus) || referralStatusOptions[0];
    
    const currentDecision = administrativePenalty.decision || "";
    const selectedDecisionOption = decisionOptions.find(option => option.id === currentDecision) || null;
    
    return {
      referral_status: selectedReferralOption,
      date_referred: administrativePenalty.date_referred ? dayjs(administrativePenalty.date_referred) : (undefined as unknown as Dayjs),
      decision_date: administrativePenalty.decision_date ? dayjs(administrativePenalty.decision_date) : (undefined as unknown as Dayjs),
      decision: selectedDecisionOption,
      penalty_amount: null, // New field, not in current model
    };
  }, [administrativePenalty]);

  const methods = useForm<AdministrativePenaltyUpdateFormType>({
    resolver: yupResolver(administrativePenaltyUpdateSchema),
    mode: "onBlur",
    defaultValues,
  });

  const { reset, handleSubmit, watch } = methods;
  const decision = watch("decision");

  useEffect(() => {
    reset(defaultValues);
  }, [reset, defaultValues]);

  const onUpdateSuccess = (data: AdministrativePenalty) => {
    queryClient.invalidateQueries({
      queryKey: ["inspection-administrative-penalties", inspectionData.id],
    });
    notify.success("Administrative Penalty updated successfully");
    onSuccess?.(data);
    setModalClose();
  };

  const { mutate: updateAdministrativePenalty, isPending: isPendingUpdate } =
    useUpdateAdministrativePenalty(onUpdateSuccess);

  const onDeleteSuccess = () => {
    queryClient.invalidateQueries({
      queryKey: ["inspection-administrative-penalties", inspectionData.id],
    });
    notify.success("Administrative Penalty deleted successfully");
    onSuccess?.(administrativePenalty);
    setModalClose();
  };

  const { mutate: deleteAdministrativePenalty, isPending: isPendingDelete } =
    useDeleteAdministrativePenalty(onDeleteSuccess);

  const handleSubmitForm = useCallback(
    (data: AdministrativePenaltyUpdateFormType) => {
      const updateData: AdministrativePenaltyAPIData = {
        inspection_id: inspectionData?.id ?? 0,
        inspection_requirement_ids: administrativePenalty.administrative_penalty_requirement_maps.map(
          (map) => map.inspection_requirement_id
        ),
        referral_status: typeof data.referral_status === 'string' ? data.referral_status : data.referral_status?.id || '',
      };

      // Only add optional fields if they have values
      if (data.date_referred) {
        updateData.date_referred = data.date_referred.format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
      }
      
      if (data.decision_date) {
        updateData.decision_date = data.decision_date.format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
      }
      
      if (data.decision) {
        updateData.decision = typeof data.decision === 'string' ? data.decision : data.decision?.id || '';
      }
      
      if (data.penalty_amount && !isNaN(Number(data.penalty_amount))) {
        updateData.penalty_amount = Number(data.penalty_amount);
      }

      updateAdministrativePenalty({
        administrativePenaltyId: administrativePenalty.id,
        administrativePenalty: updateData,
      });
    },
    [updateAdministrativePenalty, inspectionData, administrativePenalty]
  );

  const handleCancel = () => {
    setModalClose();
  };

  const handleDelete = () => {
    deleteAdministrativePenalty({
      administrativePenaltyId: administrativePenalty.id,
    });
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleSubmitForm)}>
        <ModalTitleBar title="Administrative Penalty Recommendation" />
        <Box sx={{ p: "1rem 1.5rem" }}>
          <ControlledAutoComplete
            name="referral_status"
            label="Referral Status"
            options={referralStatusOptions}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            placeholder="Select referral status"
            sx={{ mb: 2 }}
            fullWidth
          />
          
          <Box sx={{ display: "flex", gap: 1 }}>
            <ControlledDateField
              name="date_referred"
              label="Date Referred to Decision Maker"
              sx={{ width: "100%" }}
            />
            
            <ControlledDateField
              name="decision_date"
              label="Decision Date"
               sx={{ width: "100%" }}
            />
          </Box>
          
          <ControlledAutoComplete
            name="decision"
            label="DM Decision"
            options={decisionOptions}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            placeholder="Select an option..."
            sx={{ mb: 2 }}
            fullWidth
          />
          
          {decision?.id === "AP_ISSUED" && (
            <ControlledTextField
              name="penalty_amount"
              label="Penalty Amount"
              placeholder="Enter penalty amount"
              type="number"
              sx={{ mb: 2 }}
              fullWidth
            />
          )}
        </Box>
        <ModalActions
          onSecondaryAction={handleCancel}
          onPrimaryAction={handleSubmit(handleSubmitForm)}
          onDeleteAction={handleDelete}
          isLoading={isPendingUpdate || isPendingDelete}
          primaryActionButtonText="Save"
          secondaryActionButtonText="Cancel"
        />
      </form>
    </FormProvider>
  );
};

export default AdministrativePenaltyUpdateModal; 