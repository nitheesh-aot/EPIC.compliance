import { DialogContent, Typography, Button } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import ModalTitleBar from "@/components/Shared/Modals/ModalTitleBar";
import ModalActions from "@/components/Shared/Modals/ModalActions";
import { FC, useCallback, useEffect } from "react";
import {
  useCaseFilesByProjectId,
  useCreateCaseFile,
  useInitiationsData,
} from "@/hooks/useCaseFiles";
import ControlledAutoComplete from "@/components/Shared/Controlled/ControlledAutoComplete";
import { CaseFile, CaseFileAPIData } from "@/models/CaseFile";
import { notify } from "@/store/snackbarStore";
import { AxiosError } from "axios";
import { INITIATION } from "@/utils/constants";

type LinkCaseFileModalProps = {
  onSubmit: (caseFileId: number) => void;
  caseFileData: CaseFileAPIData;
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
  caseFileData,
}) => {
  const { data: initiationList } = useInitiationsData();
  const { data: caseFilesList } = useCaseFilesByProjectId(
    caseFileData.project_id!
  );

  const methods = useForm<LinkCaseFileFormType>({
    resolver: yupResolver(linkCaseFileSchema),
    mode: "onBlur",
    defaultValues: initFormData,
  });

  const { handleSubmit, reset } = methods;

  const onSuccess = useCallback(
    (data: CaseFile) => {
      notify.success(
        `Case File ${data.case_file_number} was successfully created`
      );
      onSubmit(data.id);
      reset();
    },
    [onSubmit, reset]
  );

  const onError = useCallback((err: AxiosError) => {
    notify.error(err?.message);
  }, []);

  const { mutate: createCaseFile } = useCreateCaseFile(onSuccess, onError);

  useEffect(() => {
    reset(initFormData);
  }, [reset]);

  const onSubmitHandler = async (data: LinkCaseFileFormType) => {
    const caseFileId = (data.caseFile as CaseFile).id;
    onSubmit(caseFileId);
  };

  const createNewCaseFile = () => {
    caseFileData.initiation_id =
      initiationList?.find((inititation) => inititation.id === INITIATION.INSPECTION_ID)?.id ?? "";
    createCaseFile(caseFileData);
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
          <Button
            color="secondary"
            fullWidth
            sx={{ mb: "2.5rem" }}
            onClick={createNewCaseFile}
          >
            Create New Case File
          </Button>
        </DialogContent>
        {caseFilesList && caseFilesList.length > 0 && (
          <ModalActions primaryActionButtonText="Link" isButtonValidation />
        )}
      </form>
    </FormProvider>
  );
};

export default LinkCaseFileModal;
