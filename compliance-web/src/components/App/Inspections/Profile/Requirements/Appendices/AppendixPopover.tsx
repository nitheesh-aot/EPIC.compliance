import { Box } from "@mui/material";
import * as yup from "yup";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import ControlledTextField from "@/components/Shared/Controlled/ControlledTextField";
import { useEffect, useMemo } from "react";
import { Appendix, AppendixFormData } from "@/models/Appendix";
import PopoverActions from "@/components/Shared/Popover/PopoverActions";
import { useAddAppendix, useDeleteAppendix, useUpdateAppendix } from "@/hooks/useAppendices";

type AppendixPopoverProps = {
  onSubmit: (message: string) => void;
  inspectionId: number;
  appendixData?: Appendix;
};

const appendixFormSchema = yup.object().shape({
  appendixNumber: yup
    .string()
    .nullable()
    .required("Appendix Number is required"),
  documentTitle: yup.string().nullable().required("Document Title is required"),
});

type AppendixSchemaType = yup.InferType<typeof appendixFormSchema>;

const initFormData: AppendixFormData = {
  appendixNumber: "",
  documentTitle: "",
};

const AppendixPopover: React.FC<AppendixPopoverProps> = ({
  onSubmit,
  inspectionId,
  appendixData,
}) => {
  const defaultValues = useMemo<AppendixFormData>(() => {
    return appendixData
      ? {
          appendixNumber: appendixData.appendix_no?.toString() ?? "",
          documentTitle: appendixData.document_title ?? "",
        }
      : initFormData;
  }, [appendixData]);

  const methods = useForm<AppendixSchemaType>({
    resolver: yupResolver(appendixFormSchema),
    mode: "onBlur",
    defaultValues,
  });

  const { handleSubmit, reset } = methods;

  const onSuccess = () => {
    if (appendixData) {
      onSubmit("Appendix updated successfully");
    } else {
      onSubmit("Appendix added successfully");
    }
  };

  const { mutate: addAppendix } = useAddAppendix(onSuccess);
  const { mutate: updateAppendix } = useUpdateAppendix(onSuccess);
  const { mutate: deleteAppendix } = useDeleteAppendix(onSuccess);

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const onSubmitHandler = (data: AppendixSchemaType) => {
    const formData = data as AppendixFormData;
    if (appendixData) {
      updateAppendix({
        id: appendixData.id ?? 0,
        appendix: {
          inspection_id: inspectionId,
          appendix_no: formData.appendixNumber,
          document_title: formData.documentTitle,
        },
      });
    } else {
      addAppendix({
        inspection_id: inspectionId,
        appendix_no: formData.appendixNumber,
        document_title: formData.documentTitle,
      });
    }
  };

  const onDeleteHandler = () => {
    deleteAppendix(appendixData?.id ?? 0);
  };

  return (
    <>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmitHandler)}>
          <Box display="flex" flexDirection="column" px={2} pt={2}>
            <ControlledTextField
              name="appendixNumber"
              label="Appendix #"
              fullWidth
            />
            <ControlledTextField
              name="documentTitle"
              label="Document Title"
              multiline
              fullWidth
            />
          </Box>
          <PopoverActions
            primaryActionButtonText={appendixData ? "Save" : "Add"}
            onDeleteAction={appendixData ? onDeleteHandler : undefined}
            onDeleteConfirmationText="Delete Appendix?"
          />
        </form>
      </FormProvider>
    </>
  );
};

export default AppendixPopover;
