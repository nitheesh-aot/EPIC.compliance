import {
  useCreateCaseFile,
  useInitiationsData,
  useUpdateCaseFile,
} from "@/hooks/useCaseFiles";
import { useStaffUsersData } from "@/hooks/useStaff";
import { useProjectsData } from "@/hooks/useProjects";
import { CaseFile, CaseFileAPIData, CaseFileFormData } from "@/models/CaseFile";
import { Initiation } from "@/models/Initiation";
import { Project } from "@/models/Project";
import { StaffUser } from "@/models/Staff";
import { yupResolver } from "@hookform/resolvers/yup";
import { Box } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import CaseFileForm from "./CaseFileForm";
import dateUtils from "@/utils/dateUtils";
import DrawerTitleBar from "@/components/Shared/Drawer/DrawerTitleBar";
import { useCallback, useEffect, useMemo } from "react";
import dayjs, { Dayjs } from "dayjs";
import { useMenuStore } from "@/store/menuStore";
import DrawerActionBarTop from "@/components/Shared/Drawer/DrawerActionBarTop";
import DrawerActionBarBottom from "@/components/Shared/Drawer/DrawerActionBarBottom";
import { KC_USER_GROUPS } from "@/hooks/useAuthorization";
import { useIsRolesAllowed } from "@/hooks/useAuthorization";

type CaseFileDrawerProps = {
  onSubmit: (submitMsg: string) => void;
  caseFile?: CaseFile;
};

const caseFileFormSchema = yup.object().shape({
  project: yup.object<Project>().nullable().required("Project is required"),
  initiation: yup
    .object<Initiation>()
    .nullable()
    .required("Initiation is required"),
  primaryOfficer: yup
    .object<StaffUser>()
    .nullable()
    .required("Primary is required"),
  officers: yup.array().of(yup.object<StaffUser>()).nullable(),
  dateCreated: yup.mixed<Dayjs>().nullable(),
  caseFileNumber: yup.string().nullable(),
});

type CaseFileSchemaType = yup.InferType<typeof caseFileFormSchema>;

const initFormData: CaseFileFormData = {
  project: undefined,
  dateCreated: undefined,
  primaryOfficer: undefined,
  officers: [],
  initiation: undefined,
  caseFileNumber: undefined,
};

const CaseFileDrawer: React.FC<CaseFileDrawerProps> = ({
  onSubmit,
  caseFile,
}) => {
  const { data: projectList } = useProjectsData({
    includeUnapproved: !!caseFile,
  });
  const { data: initiationList } = useInitiationsData();
  const { data: staffUserList } = useStaffUsersData();
  const { appHeaderHeight } = useMenuStore();

  const isSuperUser = useIsRolesAllowed([KC_USER_GROUPS.SUPERUSER]);

  const defaultValues = useMemo<CaseFileFormData>(() => {
    if (caseFile) {
      return {
        project: caseFile.project,
        dateCreated: dayjs(caseFile.date_created),
        primaryOfficer: caseFile.primary_officer,
        officers: caseFile.officers,
        initiation: caseFile.initiation,
        caseFileNumber: caseFile.case_file_number,
      };
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

  const onSuccess = useCallback(() => {
    onSubmit(caseFile ? "Changes saved successfully." : "Successfully added!");
    reset();
  }, [caseFile, onSubmit, reset]);

  const { mutate: createCaseFile } = useCreateCaseFile(onSuccess);
  const { mutate: updateCaseFile } = useUpdateCaseFile(onSuccess);

  const onSubmitHandler = useCallback(
    (data: CaseFileSchemaType) => {
      const caseFileData: CaseFileAPIData = {
        project_id: (data.project as Project).id,
        initiation_id: (data.initiation as Initiation).id,
        primary_officer_id: (data.primaryOfficer as StaffUser).id,
        officer_ids:
          (data.officers as StaffUser[])?.map((user) => user.id) ?? [],
      };
      if (isSuperUser) {
        caseFileData.date_created = dateUtils.dateToISO(
          data.dateCreated ?? dayjs()
        );
        caseFileData.case_file_number = data.caseFileNumber ?? "";
      }
      if (caseFile) {
        updateCaseFile({ id: caseFile.id, caseFile: caseFileData });
      } else {
        createCaseFile(caseFileData);
      }
    },
    [caseFile, createCaseFile, isSuperUser, updateCaseFile]
  );

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmitHandler)}>
        <DrawerTitleBar
          title={caseFile ? caseFile.case_file_number : "Create Case File"}
          isFormDirtyCheck
        />
        <DrawerActionBarTop isShowActionBar={!caseFile} />
        <Box
          height={`calc(100vh - ${appHeaderHeight + 129}px)`} // 64px (DrawerTitleBar height) + 65px (DrawerActionBar height)
          overflow={"auto"}
        >
          <CaseFileForm
            projectList={projectList ?? []}
            initiationList={initiationList ?? []}
            staffUsersList={staffUserList ?? []}
            isEditMode={!!caseFile}
            isSuperUser={isSuperUser}
          />
        </Box>
        <DrawerActionBarBottom isShowActionBar={!!caseFile} />
      </form>
    </FormProvider>
  );
};

export default CaseFileDrawer;
