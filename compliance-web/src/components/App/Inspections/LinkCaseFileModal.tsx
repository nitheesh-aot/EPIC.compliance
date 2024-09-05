import { DialogContent, Typography, Button } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import ModalTitleBar from "@/components/Shared/Modals/ModalTitleBar";
import ModalActions from "@/components/Shared/Modals/ModalActions";
import { FC, useEffect } from "react";
import { useCaseFilesByProjectId } from "@/hooks/useCaseFiles";
import ControlledAutoComplete from "@/components/Shared/Controlled/ControlledAutoComplete";
import { CaseFile } from "@/models/CaseFile";

type LinkCaseFileModalProps = {
  onSubmit: (caseFileId: number) => void;
  projectId: number;
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

const LinkCaseFileModal: FC<LinkCaseFileModalProps> = ({
  onSubmit,
  projectId,
}) => {
  const { data: caseFilesList } = useCaseFilesByProjectId(projectId!);

  const methods = useForm<LinkCaseFileFormType>({
    resolver: yupResolver(linkCaseFileSchema),
    mode: "onBlur",
    defaultValues: initFormData,
  });

  const { handleSubmit, reset } = methods;

  useEffect(() => {
    reset(initFormData);
  }, [caseFilesList, reset]);

  const onSubmitHandler = async (data: LinkCaseFileFormType) => {
    // eslint-disable-next-line no-console
    console.log(data.caseFile);
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
            options={caseFilesList ?? []}
            getOptionLabel={(option) => option.case_file_number ?? ""}
            getOptionKey={(option) => option.id}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            fullWidth
            sx={{ mb: "-0.5rem" }}
            disabled={!caseFilesList?.length}
          />
          <Typography variant="body1" textAlign={"center"} mb={"1rem"}>
            OR
          </Typography>
          <Button color="secondary" fullWidth sx={{ mb: "2.5rem" }}>
            Create New Case File
          </Button>
        </DialogContent>
        <ModalActions primaryActionButtonText="Link" isButtonValidation />
      </form>
    </FormProvider>
  );
};

export default LinkCaseFileModal;
