import { Box, DialogContent, Typography } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import ModalTitleBar from "@/components/Shared/Modals/ModalTitleBar";
import ModalActions from "@/components/Shared/Modals/ModalActions";
import { FC, useCallback, useEffect } from "react";
import ControlledAutoComplete from "@/components/Shared/Controlled/ControlledAutoComplete";
import { EnforcementActionEnum } from "@/utils/constants";
import { InspectionRequirement } from "@/models/InspectionRequirement";
import { useCreateInspectionOrder } from "@/hooks/useInspectionOrders";
import {
  InspectionOrder,
  InspectionOrderAPIData,
} from "@/models/InspectionOrder";
import ControlledCheckbox from "@/components/Shared/Controlled/ControlledCheckbox";
import { BCDesignTokens } from "epic.theme";
import { WarningAmberOutlined } from "@mui/icons-material";

type EnforcementModalProps = {
  inspectionId: number;
  enforcementType: EnforcementActionEnum;
  requirementsList: InspectionRequirement[];
  onSubmit: (message: string) => void;
};

const enforcementSchema = yup.object().shape({
  requirements: yup
    .array()
    .of(yup.object<InspectionRequirement>())
    .nullable()
    .min(1, "At least one Requirement is required")
    .required("Requirement is required"),
  isHistoricalRecord: yup.boolean().nullable(),
});

type EnforcementFormType = yup.InferType<typeof enforcementSchema>;

const initFormData = {
  requirements: undefined,
  isHistoricalRecord: false,
};

const EnforcementModal: FC<EnforcementModalProps> = ({
  inspectionId,
  onSubmit,
  requirementsList,
  enforcementType,
}) => {
  const isEnforcementOrder = enforcementType === EnforcementActionEnum.ORDER;

  const methods = useForm<EnforcementFormType>({
    resolver: yupResolver(enforcementSchema),
    mode: "onBlur",
    defaultValues: initFormData,
  });

  const { handleSubmit, reset, watch } = methods;

  const selectedRequirements = watch("requirements") as InspectionRequirement[];

  useEffect(() => {
    reset(initFormData);
  }, [reset]);

  const onSuccess = (data: InspectionOrder) => {
    onSubmit(`Order ${data.order_number} created`);
  };

  const { mutate: createInspectionOrder, isPending } =
    useCreateInspectionOrder(onSuccess);

  const onSubmitHandler = useCallback(
    (data: EnforcementFormType) => {
      const orderData: InspectionOrderAPIData = {
        inspection_requirement_ids: (
          data.requirements as InspectionRequirement[]
        ).map((requirement) => requirement.id),
      };
      createInspectionOrder({
        inspectionId,
        inspectionOrder: orderData,
      });
    },
    [createInspectionOrder, inspectionId]
  );

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmitHandler)}>
        <ModalTitleBar
          title={isEnforcementOrder ? "Create Order" : "Create Warning Letter"}
        />
        <DialogContent dividers sx={{ p: 0 }}>
          <Box sx={{ p: "1rem 1.5rem" }}>
            <ControlledAutoComplete
              name="requirements"
              label="Select Requirements"
              options={requirementsList ?? []}
              getOptionLabel={(option) => {
                return `Requirement ${option.sort_order}`;
              }}
              getOptionKey={(option) => option.id}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              fullWidth
              multiple
              disabled={!requirementsList?.length}
            />
            {selectedRequirements?.map((requirement) => (
              <Box
                key={requirement.id}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  p: 1.5,
                  mb: 1.5,
                  borderRadius: BCDesignTokens.layoutBorderRadiusMedium,
                  background: BCDesignTokens.surfaceColorBackgroundLightBlue,
                }}
              >
                <Typography variant="caption" fontWeight={700}>
                  Requirement {requirement.sort_order}
                </Typography>
                <Typography variant="subtitle2">
                  {requirement.summary}
                </Typography>
              </Box>
            ))}
            {isEnforcementOrder && (
              <ControlledCheckbox
                name="isHistoricalRecord"
                label="Check this box to enter an existing Order # for historical records."
                fontSize="small"
              />
            )}
          </Box>
          {selectedRequirements?.length > 1 && (
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 1,
                p: "1rem 1.5rem",
                background: BCDesignTokens.supportSurfaceColorWarning,
                borderTop: `1px solid`,
                borderBottom: `1px solid`,
                borderColor: BCDesignTokens.supportBorderColorWarning,
              }}
            >
              <WarningAmberOutlined fontSize="small" color="warning" />
              <Typography variant="caption">
                Note: By selecting multiple requirements, a single{" "}
                {isEnforcementOrder ? "order" : "warning letter"} will be
                created to address all selected requirements
              </Typography>
            </Box>
          )}
        </DialogContent>
        <ModalActions
          primaryActionButtonText="Create"
          isButtonValidation
          isLoading={isPending}
        />
      </form>
    </FormProvider>
  );
};

export default EnforcementModal;
