import ControlledDateTimeField from "@/components/Shared/Controlled/ControlledDateTimeField";
import ControlledRichTextEditor from "@/components/Shared/Controlled/ControlledRichTextEditor";
import ModalActions from "@/components/Shared/Modals/ModalActions";
import ModalTitleBar from "@/components/Shared/Modals/ModalTitleBar";
import {
  useCreateContinuationReportEntry,
  useDeleteContinuationReportEntry,
  useUpdateContinuationReportEntry,
} from "@/hooks/useContinuationReports";
import {
  ContinuationReport,
  ContinuationReportAPIData,
  ContinuationReportFormData,
} from "@/models/ContinuationReport";
import dateUtils from "@/utils/dateUtils";
import { yupResolver } from "@hookform/resolvers/yup";
import { DialogContent } from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { ContinuationReportContextType } from "./ContinuationReport";

type ContinuationReportEntryModal = {
  onSubmit: (submitMsg: string) => void;
  continuationReportEntry?: ContinuationReport;
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
      return {
        dateOfEntry: dayjs(continuationReportEntry.date_created),
        entry: {
          html: continuationReportEntry.rich_text,
          text: continuationReportEntry.text,
        },
      };
    }
    return initFormData;
  }, [continuationReportEntry]);

  const methods = useForm<ContinuationReportSchemaType>({
    resolver: yupResolver(continuationReportFormSchema),
    mode: "onBlur",
    defaultValues,
  });
  const maxSelectableDate = dayjs().add(1, "day");
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
  const { mutate: updateEntry } = useUpdateContinuationReportEntry(onSuccess);
  const { mutate: deleteEntry } = useDeleteContinuationReportEntry(onSuccess);

  const onSubmitHandler = (data: ContinuationReportSchemaType) => {
    const crEntry: ContinuationReportAPIData = {
      text: data.entry.text,
      rich_text: data.entry.html,
      date_created: dateUtils.dateToISO(data.dateOfEntry),
    };
    if (continuationReportEntry) {
      updateEntry({
        id: continuationReportEntry.id,
        crEntry,
      });
    } else {
      addEntry({
        ...crEntry,
        case_file_id: context.caseFileId,
        context_type: context.contextType,
        context_id: context.contextId,
      });
    }
  };

  const onDeleteEntry = () => {
    if (continuationReportEntry?.id) {
      deleteEntry(continuationReportEntry.id);
    }
  };

  return (
    <>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmitHandler)}>
          <ModalTitleBar
            title={continuationReportEntry ? "Edit Entry" : "Add Entry"}
          />
          <DialogContent dividers>
            <ControlledDateTimeField
              name="dateOfEntry"
              label="Date and Time"
              sx={{ width: "50%" }}
              maxDateTime={maxSelectableDate}
            />
            <ControlledRichTextEditor label="Entry" name="entry" />
          </DialogContent>
          <ModalActions
            primaryActionButtonText={
              continuationReportEntry ? "Save" : "Add Entry"
            }
            onDeleteAction={continuationReportEntry ? onDeleteEntry : undefined}
          />
        </form>
      </FormProvider>
    </>
  );
};

export default ContinuationReportEntryModal;
