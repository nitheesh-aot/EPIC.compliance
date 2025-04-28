import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Button, Typography } from "@mui/material";
import { useEffect, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import dayjs, { Dayjs } from "dayjs";
import ControlledDateField from "@/components/Shared/Controlled/ControlledDateField";
import { InspectionRecordApprovalPayload } from "@/models/IRApproval";
import { useReportStore } from "../reportStore";
import dateUtils from "@/utils/dateUtils";

const issuanceDateFormSchema = yup.object().shape({
  issuanceDate: yup.mixed<Dayjs>().required("Issuance date is required"),
});

type IssuanceDateSchemaType = yup.InferType<typeof issuanceDateFormSchema>;

const initFormData: IssuanceDateSchemaType = {
  issuanceDate: undefined as unknown as Dayjs,
};

type IssuanceDateProps = {
  onUpdateIRApprovalStep: (
    approvalPayloads: InspectionRecordApprovalPayload[]
  ) => void;
  onNext: () => void;
};

const IssuanceDate: React.FC<IssuanceDateProps> = ({
  onUpdateIRApprovalStep,
  onNext,
}) => {
  const { irApprovalsData } = useReportStore();

  const defaultValues = useMemo<IssuanceDateSchemaType>(() => {
    const currentApproval = irApprovalsData?.[0];
    if (currentApproval) {
      return {
        issuanceDate: currentApproval.date_response
          ? dayjs(currentApproval.date_response)
          : (undefined as unknown as Dayjs),
      };
    }
    return initFormData;
  }, [irApprovalsData]);

  const methods = useForm<IssuanceDateSchemaType>({
    resolver: yupResolver(issuanceDateFormSchema),
    mode: "onBlur",
    defaultValues,
  });

  const {
    handleSubmit,
    reset,
    formState: { isDirty },
  } = methods;

  // Reset form with defaultValues when they change
  useEffect(() => {
    if (defaultValues.issuanceDate) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  const onSubmitHandler = (data: IssuanceDateSchemaType) => {
    if (isDirty) {
      const approvalPayloads: InspectionRecordApprovalPayload[] = [
        {
          field_name: "date_response",
          value: data.issuanceDate
            ? dateUtils.dateToISO(data.issuanceDate)
            : null,
        },
      ];
      onUpdateIRApprovalStep(approvalPayloads);
    } else {
      onNext();
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmitHandler)}>
        <Typography variant="body2" mb={1}>
          Indicate the IR intended issuance date. On the date after the record
          is issued, don’t forget to update the continuation report.
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 1,
            mt: 2,
          }}
        >
          <ControlledDateField
            name="issuanceDate"
            label="Intended Issuance Date"
            height="2rem"
          />
          <Box
            sx={{
              display: "flex",
              gap: 1,
            }}
          >
            <Button variant="outlined" size="small" type="submit">
              Save
            </Button>
          </Box>
        </Box>
      </form>
    </FormProvider>
  );
};

export default IssuanceDate;
