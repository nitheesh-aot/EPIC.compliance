import { DialogContent, Stack } from "@mui/material";
import { useEffect, useMemo } from "react";
import * as yup from "yup";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import ModalTitleBar from "@/components/Shared/Modals/ModalTitleBar";
import ModalActions from "@/components/Shared/Modals/ModalActions";
import { RequirementSource } from "@/models/RequirementSource";
import { RequirementSourceFormData } from "@/models/InspectionRequirement";
import ControlledAutoComplete from "@/components/Shared/Controlled/ControlledAutoComplete";
import ControlledTextField from "@/components/Shared/Controlled/ControlledTextField";
import ControlledRichTextEditor from "@/components/Shared/Controlled/ControlledRichTextEditor";
import { useRequirementSourcesData } from "@/hooks/useComplaints";
import { RequirementSourceEnum } from "@/utils/constants";

type RequirementSourceModalProps = {
  onSubmit: (data: RequirementSourceFormData) => void;
};

const requirementSourceFormSchema = yup.object().shape({
  requirementSource: yup
    .object<RequirementSource>()
    .nullable()
    .required("Requirement Source is required"),
  sourceNumber: yup.string().nullable(),
  sourceTitle: yup.string().nullable(),
  sourceAmendmentNumber: yup.string().nullable(),
  description: yup
    .object({
      html: yup.string().required("Description is required"),
      text: yup.string().required("Description is required"),
    })
    .nullable(),
});

type RequirementSourceSchemaType = yup.InferType<
  typeof requirementSourceFormSchema
>;

const initFormData: RequirementSourceFormData = {
  requirementSource: undefined,
  sourceNumber: "",
  sourceTitle: "",
  sourceAmendmentNumber: "",
  description: undefined,
};

const RequirementSourceModal: React.FC<RequirementSourceModalProps> = ({
  onSubmit,
}) => {
  const { data: requirementSourceList } = useRequirementSourcesData();

  const defaultValues = useMemo<RequirementSourceFormData>(() => {
    return initFormData;
  }, []);

  const methods = useForm<RequirementSourceSchemaType>({
    resolver: yupResolver(requirementSourceFormSchema),
    mode: "onBlur",
    defaultValues,
  });

  const { handleSubmit, reset, control, getValues } = methods;

  const selectedRequirementSource = useWatch({
    control,
    name: "requirementSource",
    defaultValue: getValues("requirementSource") ?? undefined,
  }) as RequirementSource;

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const onSubmitHandler = (data: RequirementSourceSchemaType) => {
    // eslint-disable-next-line no-console
    console.log(data);
    onSubmit(data as RequirementSourceFormData);
  };

  return (
    <>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmitHandler)}>
          <ModalTitleBar title={"Add Requirement Source"} />
          <DialogContent dividers>
            <ControlledAutoComplete
              name="requirementSource"
              label="Requirement Source"
              options={requirementSourceList ?? []}
              getOptionLabel={(option) => option.name}
              getOptionKey={(option) => option.id}
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />
            {selectedRequirementSource?.id === RequirementSourceEnum.EACA && (
              <ControlledTextField
                name="sourceAmendmentNumber"
                label="Amendment #"
                fullWidth
              />
            )}
            <Stack direction={"row"} gap={2}>
              <ControlledTextField
                name="sourceNumber"
                label={
                  [
                    RequirementSourceEnum.SCHEDULE_B,
                    RequirementSourceEnum.EAC,
                    RequirementSourceEnum.EACA,
                  ].includes(selectedRequirementSource?.id as RequirementSourceEnum)
                    ? "Condition # (optional)"
                    : "Section # (optional)"
                }
                fullWidth
              />
              <ControlledTextField
                name="sourceTitle"
                label="Title (optional)"
                fullWidth
              />
            </Stack>
            <ControlledRichTextEditor label="Description" name="description" />
          </DialogContent>
          <ModalActions primaryActionButtonText={"Add"} />
        </form>
      </FormProvider>
    </>
  );
};

export default RequirementSourceModal;
