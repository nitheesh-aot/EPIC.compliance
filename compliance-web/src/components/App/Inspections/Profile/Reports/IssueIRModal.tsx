import { DialogContent, Typography } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import ModalTitleBar from "@/components/Shared/Modals/ModalTitleBar";
import ModalActions from "@/components/Shared/Modals/ModalActions";
import { FC, useEffect, useMemo } from "react";
import { useUpdateInspectionRecord } from "@/hooks/useInspectionReports";
import { useReportStore } from "./reportStore";
import dayjs, { Dayjs } from "dayjs";
import { InspectionRecord } from "@/models/InspectionRecord";
import dateUtils from "@/utils/dateUtils";
import ControlledDateField from "@/components/Shared/Controlled/ControlledDateField";

type IssueIRModalProps = {
  onSubmit: (message: string) => void;
};

const issueIRSchema = yup.object().shape({
  issueDate: yup.mixed<Dayjs>().required("Issuance date is required"),
});

type IssueIRFormType = yup.InferType<typeof issueIRSchema>;

const initFormData = {
  issueDate: undefined as unknown as Dayjs,
};

const IssueIRModal: FC<IssueIRModalProps> = ({ onSubmit }) => {
  const { inspectionData, inspectionReportsData, setInspectionReportsData } =
    useReportStore();

  const defaultValues = useMemo<IssueIRFormType>(() => {
    if (inspectionReportsData?.intended_issuance_date) {
      return {
        issueDate: dayjs(inspectionReportsData?.intended_issuance_date),
      };
    }
    return initFormData;
  }, [inspectionReportsData]);

  const methods = useForm<IssueIRFormType>({
    resolver: yupResolver(issueIRSchema),
    mode: "onBlur",
    defaultValues,
  });

  const { handleSubmit, reset } = methods;

  useEffect(() => {
    reset(defaultValues);
  }, [reset, defaultValues]);

  const onSuccess = (data: InspectionRecord) => {
    setInspectionReportsData(data);
    onSubmit("Approval request sent");
  };

  const { mutate: updateInspectionRecord, isPending } =
    useUpdateInspectionRecord(onSuccess);

  const onSubmitHandler = (data: IssueIRFormType) => {
    updateInspectionRecord({
      inspectionId: inspectionData?.id ?? 0,
      inspectionRecordId: inspectionReportsData?.id ?? 0,
      updateRecord: {
        field_name: "date_issued",
        value: dateUtils.dateToISO(data.issueDate),
      },
    });
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmitHandler)}>
        <ModalTitleBar title={"Issue IR?"} />
        <DialogContent dividers>
          <Typography variant="body1" mb={2}>
            You are about to issue Inspection Record:{" "}
            <b>{inspectionData?.ir_number}</b>
          </Typography>
          <Typography variant="body2" mb={1.5}>
            If actual issue date is different from the intended issuance date,
            please update it below.
          </Typography>
          <ControlledDateField name="issueDate" label="Actual Issue Date" />
        </DialogContent>
        <ModalActions
          primaryActionButtonText={"Save & Issue"}
          isButtonValidation
          isLoading={isPending}
        />
      </form>
    </FormProvider>
  );
};

export default IssueIRModal;
