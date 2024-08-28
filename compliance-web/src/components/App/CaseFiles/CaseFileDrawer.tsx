import { useCreateCaseFile, useInitiationsData } from "@/hooks/useCaseFiles";
import { useStaffUsersData } from "@/hooks/useStaff";
import { useProjectsData } from "@/hooks/useProjects";
import { CaseFile, CaseFileAPIData, CaseFileFormData } from "@/models/CaseFile";
import { Initiation } from "@/models/Initiation";
import { Project } from "@/models/Project";
import { StaffUser } from "@/models/Staff";
import { notify } from "@/store/snackbarStore";
import { yupResolver } from "@hookform/resolvers/yup";
import { Alert, Box, Button, Typography } from "@mui/material";
import { AxiosError } from "axios";
import { BCDesignTokens } from "epic.theme";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import CaseFileForm from "./CaseFileForm";
import dateUtils from "@/utils/dateUtils";
import DrawerTitleBar from "@/components/Shared/Drawer/DrawerTitleBar";
import { useEffect, useMemo } from "react";

type CaseFileDrawerProps = {
  onSubmit: (submitMsg: string) => void;
  caseFile?: CaseFile;
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
    .string()
    .nullable()
    .required("Case file number is required"),
});

type CaseFileSchemaType = yup.InferType<typeof caseFileFormSchema>;

const initFormData: CaseFileFormData = {
  project: undefined,
  dateCreated: undefined,
  leadOfficer: undefined,
  officers: [],
  initiation: undefined,
  caseFileNumber: undefined,
};

const CaseFileDrawer: React.FC<CaseFileDrawerProps> = ({
  onSubmit,
  caseFile,
}) => {
  const { data: projectList } = useProjectsData();
  const { data: initiationList } = useInitiationsData();
  const { data: staffUserList } = useStaffUsersData();

  const defaultValues = useMemo<CaseFileFormData>(() => {
    if (caseFile) {
      // TDOD: Map existing data
    }
    return initFormData;
  }, [caseFile]);

  const methods = useForm<CaseFileSchemaType>({
    resolver: yupResolver(caseFileFormSchema),
    mode: "onBlur",
    defaultValues,
  });

  const { handleSubmit, reset } = methods;

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const onSuccess = () => {
    onSubmit(caseFile ? "Successfully updated!" : "Successfully added!");
    reset();
  };

  const onError = (err: AxiosError) => {
    notify.error(err?.message);
  };

  const { mutate: createCaseFile } = useCreateCaseFile(onSuccess, onError);

  const onSubmitHandler = (data: CaseFileSchemaType) => {
    const caseFileData: CaseFileAPIData = {
      project_id: (data.project as Project)?.id ?? "",
      date_created: dateUtils.dateToUTC(data.dateCreated),
      initiation_id: (data.initiation as Initiation).id,
      case_file_number: data.caseFileNumber,
      lead_officer_id: (data.leadOfficer as StaffUser)?.id,
      officer_ids: (data.officers as StaffUser[])?.map((user) => user.id) ?? [],
    };
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
          <DrawerTitleBar title="Create Case File Number" isFormDirtyCheck />
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
            <Typography
              variant="body2"
              sx={{
                fontWeight: BCDesignTokens.typographyFontWeightsBold,
                color: BCDesignTokens.typographyColorPrimary,
                marginBottom: BCDesignTokens.layoutMarginMedium,
              }}
            >
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
