import { DialogContent } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import ModalTitleBar from "@/components/Shared/Modals/ModalTitleBar";
import ModalActions from "@/components/Shared/Modals/ModalActions";
import { FC, useEffect } from "react";
import ControlledAutoComplete from "@/components/Shared/Controlled/ControlledAutoComplete";
import { CaseFile } from "@/models/CaseFile";
import { useCaseFilesData } from "@/hooks/useCaseFiles";

type LinkCaseFileModalProps = {
  onSubmit: (caseFileId: number) => void;
};

const linkCaseFileSchema = yup.object().shape({
  caseFile: yup
    .object<CaseFile>()
    .nullable()
    .required("Please select a case file"),
});

type LinkCaseFileFormType = yup.InferType<typeof linkCaseFileSchema>;

const initFormData = {
  caseFile: undefined,
};

const LinkCaseFileModal: FC<LinkCaseFileModalProps> = ({ onSubmit }) => {
  const { data: caseFilesList } = useCaseFilesData();

  const methods = useForm<LinkCaseFileFormType>({
    resolver: yupResolver(linkCaseFileSchema),
    mode: "onBlur",
    defaultValues: initFormData,
  });

  const { handleSubmit, reset } = methods;

  useEffect(() => {
    reset(initFormData);
  }, [reset]);

  const onSubmitHandler = async (data: LinkCaseFileFormType) => {
    const caseFileId = (data.caseFile as CaseFile).id;
    onSubmit(caseFileId);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmitHandler)}>
        <ModalTitleBar title="Link to Case File" />
        <DialogContent dividers>
          <ControlledAutoComplete
            name="caseFile"
            label="Case File"
            placeholder="Select existing Case File"
            options={caseFilesList ?? []}
            getOptionLabel={(option) => option.case_file_number ?? ""}
            getOptionKey={(option) => option.id}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            fullWidth
            sx={{ mb: "-0.5rem" }}
            disabled={!caseFilesList?.length}
          />
        </DialogContent>
        {caseFilesList && caseFilesList.length > 0 && (
          <ModalActions primaryActionButtonText="Link" isButtonValidation />
        )}
      </form>
    </FormProvider>
  );
};

export default LinkCaseFileModal;
