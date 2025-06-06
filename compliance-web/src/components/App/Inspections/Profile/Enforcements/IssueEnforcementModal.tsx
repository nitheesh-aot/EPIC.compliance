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
import { InspectionWarningLetter } from "@/models/InspectionWarningLetter";
import { useIssueWarningLetter } from "@/hooks/useInspectionWarningLetters";

type IssueEnforcementModalProps = {
  onSubmit: (message: string) => void;
  inspectionOrder?: InspectionOrder;
  warningLetter?: InspectionWarningLetter;
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
  warningLetter,
}) => {
  const defaultValues = useMemo<IssueEnforcementFormType>(() => {
    if ((inspectionOrder || warningLetter)?.intended_issuance_date) {
      return {
        issueDate: dayjs(
          (inspectionOrder || warningLetter)?.intended_issuance_date
        ),
      };
    }
    return initFormData;
  }, [inspectionOrder, warningLetter]);

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
    if (inspectionOrder) {
      onSubmit("Order issued");
    } else {
      onSubmit("Warning letter issued");
    }
  };

  const { mutate: issueOrder, isPending: isOrderPending } = useIssueOrder(onSuccess);

  const { mutate: issueWarningLetter, isPending: isWarningLetterPending } =
    useIssueWarningLetter(onSuccess);

  const onSubmitHandler = (data: IssueEnforcementFormType) => {
    if (inspectionOrder) {
      issueOrder({
        inspectionOrderId: inspectionOrder?.id ?? 0,
        issuePayload: {
          date_issued: dateUtils.dateToISO(data.issueDate),
        },
      });
    } else {
      issueWarningLetter({
        inspectionWarningLetterId: warningLetter?.id ?? 0,
        issuePayload: {
          date_issued: dateUtils.dateToISO(data.issueDate),
        },
      });
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmitHandler)}>
        <ModalTitleBar title={"Issue Order?"} />
        <DialogContent dividers>
          <Typography variant="body1" mb={2}>
            You are about to issue {inspectionOrder ? "Order" : "Warning Letter"}:{" "}
            <b>{inspectionOrder?.order_number || warningLetter?.warning_letter_number}</b>
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
          isLoading={isOrderPending || isWarningLetterPending}
        />
      </form>
    </FormProvider>
  );
};

export default IssueEnforcementModal;
