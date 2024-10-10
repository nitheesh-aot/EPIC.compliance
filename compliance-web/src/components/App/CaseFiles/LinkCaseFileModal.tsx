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
} from "@/hooks/useCaseFiles";
import ControlledAutoComplete from "@/components/Shared/Controlled/ControlledAutoComplete";
import { CaseFile, CaseFileAPIData } from "@/models/CaseFile";
import { notify } from "@/store/snackbarStore";
import dateUtils from "@/utils/dateUtils";

type LinkCaseFileModalProps = {
  onSubmit: (caseFileId: number) => void;
  projectId?: number;
  initiationId: string;
  leadOfficerId?: number;
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
  initiationId,
  leadOfficerId,
}) => {
  const { data: caseFilesList } = useCaseFilesByProjectId(projectId!);

  const methods = useForm<LinkCaseFileFormType>({
    resolver: yupResolver(linkCaseFileSchema),
    mode: "onBlur",
    defaultValues: initFormData,
  });

  const { handleSubmit, reset, watch } = methods;

  const caseFileValue = watch("caseFile");

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

  const { mutate: createCaseFile } = useCreateCaseFile(onSuccess);

  useEffect(() => {
    reset(initFormData);
  }, [reset]);

  const onSubmitHandler = async (data: LinkCaseFileFormType) => {
    const caseFileId = (data.caseFile as CaseFile).id;
    onSubmit(caseFileId);
  };

  const createNewCaseFile = () => {
    const caseFileData: CaseFileAPIData = {
      project_id: projectId,
      initiation_id: initiationId,
      date_created: dateUtils.dateToISO(new Date()),
      lead_officer_id: leadOfficerId,
    };
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
            placeholder="Select existing Case File"
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
            disabled={!!caseFileValue} // Disable button if caseFile dropdown has a value
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
