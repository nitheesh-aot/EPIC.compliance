import { Box, Collapse, DialogContent, Typography } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import ModalTitleBar from "@/components/Shared/Modals/ModalTitleBar";
import ModalActions from "@/components/Shared/Modals/ModalActions";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
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
import { ExpandMoreRounded, WarningAmberOutlined } from "@mui/icons-material";
import ControlledTextField from "@/components/Shared/Controlled/ControlledTextField";
import { useCreateWarningLetter } from "@/hooks/useInspectionWarningLetters";
import {
  InspectionWarningLetter,
  InspectionWarningLetterAPIData,
} from "@/models/InspectionWarningLetter";

type EnforcementModalProps = {
  inspectionId: number;
  enforcementType: EnforcementActionEnum;
  requirementsList: InspectionRequirement[];
  requirement?: InspectionRequirement;
  onSubmit: (
    message: string,
    data: InspectionOrder | InspectionWarningLetter
  ) => void;
};

const enforcementSchema = yup.object().shape({
  requirements: yup
    .array()
    .of(yup.object<InspectionRequirement>())
    .nullable()
    .min(1, "At least one Requirement is required")
    .required("Requirement is required"),
  isHistoricalRecord: yup.boolean().nullable(),
  manualOrderNumber: yup
    .string()
    .nullable()
    .when("isHistoricalRecord", {
      is: (value: boolean) => value === true,
      then: (schema) => schema.required("Manual Order # is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
});

type EnforcementFormType = yup.InferType<typeof enforcementSchema>;

const initFormData = {
  requirements: undefined,
  isHistoricalRecord: false,
  manualOrderNumber: undefined,
};

const ManualOrderNumberInfo = () => {
  const [isInfoExpanded, setIsInfoExpanded] = useState(false);

  return (
    <Box
      sx={{ display: "flex", gap: 1, ml: 3, cursor: "pointer" }}
      onClick={() => setIsInfoExpanded(!isInfoExpanded)}
    >
      <ExpandMoreRounded
        sx={{
          marginTop: "-0.125rem",
          fontSize: "1.25rem",
          transform: isInfoExpanded ? "rotate(180deg)" : "rotate(270deg)",
        }}
      />
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography variant="caption">Why enter a manual Order #?</Typography>
        <Collapse in={isInfoExpanded}>
          <Typography variant="caption">
            If you are entering an order that was previously created outside
            this system, check this box and enter the existing Order #. If this
            is a new order, leave the box unchecked, and the system will
            generate a number for you.
          </Typography>
        </Collapse>
      </Box>
    </Box>
  );
};

const EnforcementModal: FC<EnforcementModalProps> = ({
  inspectionId,
  onSubmit,
  requirementsList,
  enforcementType,
  requirement,
}) => {
  const isEnforcementOrder = enforcementType === EnforcementActionEnum.ORDER;

  const defaultValues = useMemo(() => {
    if (requirement) {
      return {
        requirements: [requirement],
      };
    }
    return initFormData;
  }, [requirement]);

  const methods = useForm<EnforcementFormType>({
    resolver: yupResolver(enforcementSchema),
    mode: "onBlur",
    defaultValues,
  });

  const { handleSubmit, reset, watch } = methods;

  const selectedRequirements = watch("requirements") as InspectionRequirement[];
  const isHistoricalRecord = watch("isHistoricalRecord");

  useEffect(() => {
    reset(defaultValues);
  }, [reset, defaultValues]);

  const onSuccess = (data: InspectionOrder | InspectionWarningLetter) => {
    if (isEnforcementOrder) {
      onSubmit(`Order ${(data as InspectionOrder).order_number} created`, data);
    } else {
      onSubmit(
        `Warning Letter ${(data as InspectionWarningLetter).warning_letter_number} created`,
        data
      );
    }
  };

  const { mutate: createInspectionOrder, isPending: isPendingOrder } =
    useCreateInspectionOrder(onSuccess);

  const {
    mutate: createInspectionWarningLetter,
    isPending: isPendingWarningLetter,
  } = useCreateWarningLetter(onSuccess);

  const onSubmitHandler = useCallback(
    (data: EnforcementFormType) => {
      if (isEnforcementOrder) {
        const orderData: InspectionOrderAPIData = {
          inspection_id: inspectionId,
          inspection_requirement_ids: (
            data.requirements as InspectionRequirement[]
          ).map((requirement) => requirement.id),
        };
        if (data.isHistoricalRecord) {
          orderData.order_number = data.manualOrderNumber ?? "";
        }
        createInspectionOrder({
          inspectionOrder: orderData,
        });
      } else {
        const warningLetterData: InspectionWarningLetterAPIData = {
          inspection_id: inspectionId,
          inspection_requirement_ids: (
            data.requirements as InspectionRequirement[]
          ).map((requirement) => requirement.id),
        };
        createInspectionWarningLetter({
          inspectionWarningLetter: warningLetterData,
        });
      }
    },
    [
      createInspectionOrder,
      createInspectionWarningLetter,
      inspectionId,
      isEnforcementOrder,
    ]
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
              <>
                <ControlledCheckbox
                  name="isHistoricalRecord"
                  label="Check this box to enter an existing Order # for historical records."
                  fontSize="small"
                />
                <ManualOrderNumberInfo />
                {isHistoricalRecord && (
                  <ControlledTextField
                    name="manualOrderNumber"
                    label="Manual Order #"
                    placeholder="Enter existing order number"
                    sx={{ mt: 2 }}
                    fullWidth
                  />
                )}
              </>
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
          isLoading={isPendingOrder || isPendingWarningLetter}
        />
      </form>
    </FormProvider>
  );
};

export default EnforcementModal;
