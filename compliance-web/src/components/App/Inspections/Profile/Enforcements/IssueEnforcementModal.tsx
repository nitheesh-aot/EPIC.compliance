import { DialogContent, Typography } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import ModalTitleBar from "@/components/Shared/Modals/ModalTitleBar";
import ModalActions from "@/components/Shared/Modals/ModalActions";
import { FC, useEffect, useMemo } from "react";
import dayjs, { Dayjs } from "dayjs";
import dateUtils from "@/utils/dateUtils";
import ControlledDateField from "@/components/Shared/Controlled/ControlledDateField";
import { InspectionOrder } from "@/models/InspectionOrder";
import { useIssueOrder } from "@/hooks/useInspectionOrders";

type IssueEnforcementModalProps = {
  onSubmit: (message: string) => void;
  inspectionOrder: InspectionOrder;
};

const issueEnforcementSchema = yup.object().shape({
  issueDate: yup.mixed<Dayjs>().required("Issuance date is required"),
});

type IssueEnforcementFormType = yup.InferType<typeof issueEnforcementSchema>;

const initFormData = {
  issueDate: undefined as unknown as Dayjs,
};

const IssueEnforcementModal: FC<IssueEnforcementModalProps> = ({
  onSubmit,
  inspectionOrder,
}) => {
  const defaultValues = useMemo<IssueEnforcementFormType>(() => {
    if (inspectionOrder?.intended_issuance_date) {
      return {
        issueDate: dayjs(inspectionOrder?.intended_issuance_date),
      };
    }
    return initFormData;
  }, [inspectionOrder?.intended_issuance_date]);

  const methods = useForm<IssueEnforcementFormType>({
    resolver: yupResolver(issueEnforcementSchema),
    mode: "onBlur",
    defaultValues,
  });

  const { handleSubmit, reset } = methods;

  useEffect(() => {
    reset(defaultValues);
  }, [reset, defaultValues]);

  const onSuccess = () => {
    onSubmit("Order issued");
  };

  const { mutate: issueOrder, isPending } = useIssueOrder(onSuccess);

  const onSubmitHandler = (data: IssueEnforcementFormType) => {
    issueOrder({
      inspectionOrderId: inspectionOrder?.id ?? 0,
      issuePayload: {
        date_issued: dateUtils.dateToISO(data.issueDate),
      },
    });
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmitHandler)}>
        <ModalTitleBar title={"Issue Order?"} />
        <DialogContent dividers>
          <Typography variant="body1" mb={2}>
            You are about to issue Order: <b>{inspectionOrder?.order_number}</b>
          </Typography>
          <Typography variant="body2" mb={1.5}>
            If actual issue date is different from the intended issuance date,
            please update it below.
          </Typography>
          <ControlledDateField name="issueDate" label="Actual Issue Date" />
        </DialogContent>
        <ModalActions
          primaryActionButtonText={"Issue"}
          isButtonValidation
          isLoading={isPending}
        />
      </form>
    </FormProvider>
  );
};

export default IssueEnforcementModal;
