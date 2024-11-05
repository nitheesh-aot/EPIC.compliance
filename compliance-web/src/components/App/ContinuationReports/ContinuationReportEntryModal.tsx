import { DialogContent } from "@mui/material";
import { useEffect, useMemo } from "react";
import * as yup from "yup";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import ModalTitleBar from "@/components/Shared/Modals/ModalTitleBar";
import ModalActions from "@/components/Shared/Modals/ModalActions";
import { Dayjs } from "dayjs";
import { ContinuationReportAPIData, ContinuationReportFormData } from "@/models/ContinuationReport";
import ControlledRichTextEditor from "@/components/Shared/Controlled/ControlledRichTextEditor";
import ControlledDateTimeField from "@/components/Shared/Controlled/ControlledDateTimeField";
import { useCreateContinuationReportEntry } from "@/hooks/useContinuationReports";
import dateUtils from "@/utils/dateUtils";
import { ContinuationReportContextType } from "./ContinuationReport";

type ContinuationReportEntryModal = {
  onSubmit: (submitMsg: string) => void;
  continuationReportEntry?: unknown;
  context: ContinuationReportContextType;
};

const continuationReportFormSchema = yup.object().shape({
  dateOfEntry: yup
    .mixed<Dayjs>()
    .nullable()
    .required("Date Created is required"),
  entry: yup
    .object({
      html: yup.string().required("Entry is required"),
      text: yup.string().required("Entry is required"),
    })
    .nullable()
    .required("Entry is required"),
});

type ContinuationReportSchemaType = yup.InferType<
  typeof continuationReportFormSchema
>;

const initFormData: ContinuationReportFormData = {
  dateOfEntry: undefined,
  entry: undefined,
};

const ContinuationReportEntryModal: React.FC<ContinuationReportEntryModal> = ({
  onSubmit,
  continuationReportEntry,
  context,
}) => {
  const defaultValues = useMemo<ContinuationReportFormData>(() => {
    if (continuationReportEntry) {
      // map existing data
    }
    return initFormData;
  }, [continuationReportEntry]);

  const methods = useForm<ContinuationReportSchemaType>({
    resolver: yupResolver(continuationReportFormSchema),
    mode: "onBlur",
    defaultValues,
  });

  const { handleSubmit, reset } = methods;

  useEffect(() => {
    if (continuationReportEntry) {
      reset(defaultValues);
    }
  }, [defaultValues, reset, continuationReportEntry]);

  const onSuccess = () => {
    onSubmit(
      continuationReportEntry ? "Successfully updated!" : "Successfully added!"
    );
  };

  const { mutate: addEntry } = useCreateContinuationReportEntry(onSuccess);
  // const { mutate: updateStaff } = useUpdateStaff(onSuccess);

  const onSubmitHandler = (data: ContinuationReportSchemaType) => {
    // eslint-disable-next-line no-console
    console.log(data);
    const crEntry: ContinuationReportAPIData = {
      case_file_id: context.caseFileId,
      text: data.entry.text,
      rich_text: data.entry.html,
      date_created: dateUtils.dateToISO(data.dateOfEntry),
      context_type: context.contextType,
      context_id: context.contextId
    }
    if(continuationReportEntry) {
      //TODO: Update
    } else {
      addEntry(crEntry)
    }
  };

  return (
    <>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmitHandler)}>
          <ModalTitleBar title={"Add Entry"} />
          <DialogContent dividers>
            <ControlledDateTimeField
              name="dateOfEntry"
              label="Date and Time"
              sx={{ width: "50%" }}
            />
            <ControlledRichTextEditor
              label="Entry"
              name="entry"
            />
          </DialogContent>
          <ModalActions
            primaryActionButtonText={
              continuationReportEntry ? "Save" : "Add Entry"
            }
          />
        </form>
      </FormProvider>
    </>
  );
};

export default ContinuationReportEntryModal;
