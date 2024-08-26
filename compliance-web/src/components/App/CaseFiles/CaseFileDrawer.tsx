import { useCreateCaseFile, useInitiationsData } from "@/hooks/useCaseFiles";
import { useStaffUsersData } from "@/hooks/useStaff";
import { useProjectsData } from "@/hooks/useProjects";
import { CaseFile, CaseFileAPIData } from "@/models/CaseFile";
import { Initiation } from "@/models/Initiation";
import { Project } from "@/models/Project";
import { StaffUser } from "@/models/Staff";
import { useDrawer } from "@/store/drawerStore";
import { notify } from "@/store/snackbarStore";
import { theme } from "@/styles/theme";
import { yupResolver } from "@hookform/resolvers/yup";
import { Close } from "@mui/icons-material";
import { Alert, Box, Button, IconButton, Typography } from "@mui/material";
import { AxiosError } from "axios";
import { BCDesignTokens } from "epic.theme";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import CaseFileForm from "./CaseFileForm";
import dateUtils from "@/utils/dateUtils";

type CaseFileDrawerProps = {
  onSubmit: (submitMsg: string) => void;
  caseFile?: CaseFile;
};

const blockTitleStyles = {
  fontWeight: BCDesignTokens.typographyFontWeightsBold,
  color: BCDesignTokens.typographyColorPrimary,
  marginBottom: BCDesignTokens.layoutMarginMedium,
};

const caseFileFormSchema = yup.object().shape({
  project: yup.object<Project>().nullable().required("Project is required"),
  dateCreated: yup.date().nullable().required("Date Created is required"),
  leadOfficer: yup.object<StaffUser>().nullable(),
  officers: yup.array().of(yup.object<StaffUser>()).nullable(),
  initiation: yup
    .object<Initiation>()
    .nullable()
    .required("Initiation is required"),
  caseFileNumber: yup
    .number()
    .nullable()
    .required("Case file number is required")
    .typeError("Case file number must be a number"),
});

type CaseFileSchemaType = yup.InferType<typeof caseFileFormSchema>;

const CaseFileDrawer: React.FC<CaseFileDrawerProps> = ({
  onSubmit,
  caseFile,
}) => {
  const { setClose } = useDrawer();

  const { data: projectList } = useProjectsData();
  const { data: initiationList } = useInitiationsData();
  const { data: staffUserList } = useStaffUsersData();

  const methods = useForm<CaseFileSchemaType>({
    resolver: yupResolver(caseFileFormSchema),
    mode: "onBlur",
  });

  const { handleSubmit } = methods;

  const onSuccess = () => {
    onSubmit(caseFile ? "Successfully updated!" : "Successfully added!");
  };

  const onError = (err: AxiosError) => {
    notify.error(err?.message);
  };

  const { mutate: createCaseFile } = useCreateCaseFile(onSuccess, onError);

  const handleClose = () => {
    methods.reset();
    setClose();
  };

  const onSubmitHandler = (data: CaseFileSchemaType) => {
    const caseFileData: CaseFileAPIData = {
      project_id: (data.project as Project)?.id ?? "",
      date_created: dateUtils.dateToUTC(data.dateCreated),
      initiation: (data.initiation as Initiation).id,
      case_file_number: data.caseFileNumber,
      lead_officer_id: (data.leadOfficer as StaffUser)?.id,
      officer_ids: (data.officers as StaffUser[])?.map((user) => user.id) ?? [],
    };
    // eslint-disable-next-line no-console
    console.log(data);
    if (caseFile) {
      // TODO update
    } else {
      createCaseFile(caseFileData);
    }
  };

  return (
    <Box width="718px">
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmitHandler)}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0.75rem 2rem",
              borderBottom: "1px solid",
              borderColor: BCDesignTokens.supportBorderColorInfo,
            }}
          >
            <Typography variant="h6" color="primary">
              Create Case File Number
            </Typography>
            <IconButton
              aria-label="close"
              onClick={handleClose}
              sx={{
                color: theme.palette.text.primary,
              }}
            >
              <Close />
            </IconButton>
          </Box>
          <Box
            sx={{
              backgroundColor: BCDesignTokens.surfaceColorBackgroundLightGray,
              padding: "0.75rem 2rem",
              textAlign: "right",
            }}
          >
            <Button variant={"contained"} type="submit">
              Create
            </Button>
          </Box>
          <CaseFileForm
            projectList={projectList ?? []}
            initiationList={initiationList ?? []}
            staffUsersList={staffUserList ?? []}
          ></CaseFileForm>
          <Box marginTop={"0.5rem"} paddingX={"2rem"}>
            <Typography variant="body2" sx={blockTitleStyles}>
              Inspection Records
            </Typography>
            <Alert
              severity="info"
              variant="outlined"
              sx={{
                borderColor: BCDesignTokens.supportBorderColorInfo,
                backgroundColor: BCDesignTokens.supportSurfaceColorInfo,
                color: BCDesignTokens.typographyColorPrimary,
              }}
            >
              Once Inspections are created and linked, they will appear here
            </Alert>
          </Box>
        </form>
      </FormProvider>
    </Box>
  );
};

export default CaseFileDrawer;
