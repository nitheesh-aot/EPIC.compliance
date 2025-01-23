import DrawerActionBarBottom from "@/components/Shared/Drawer/DrawerActionBarBottom";
import DrawerActionBarTop from "@/components/Shared/Drawer/DrawerActionBarTop";
import DrawerTitleBar from "@/components/Shared/Drawer/DrawerTitleBar";
import { useAgenciesData } from "@/hooks/useAgencies";
import { useCurrentLoggedInUser } from "@/hooks/useAuthorization";
import { useFirstNationsData } from "@/hooks/useFirstNations";
import {
  useAttendanceOptionsData,
  useCreateInspection,
  useInitiationsData,
  useIRStatusesData,
  useIRTypesData,
  useProjectStatusesData,
  useUpdateInspection,
} from "@/hooks/useInspections";
import { useStaffUsersData } from "@/hooks/useStaff";
import { CaseFile } from "@/models/CaseFile";
import { Inspection, InspectionFormData } from "@/models/Inspection";
import { StaffUser } from "@/models/Staff";
import { useMenuStore } from "@/store/menuStore";
import { yupResolver } from "@hookform/resolvers/yup";
import { Stack } from "@mui/material";
import dayjs from "dayjs";
import { useCallback, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import InspectionFormLeft from "./InspectionFormLeft";
import InspectionFormRight from "./InspectionFormRight";
import {
  AttendanceEnum,
  formatInspectionData,
  InspectionFormSchema,
  InspectionSchemaType,
} from "./InspectionFormUtils";

type InspectionDrawerProps = {
  onSubmit: (submitMsg: string) => void;
  caseFile: CaseFile;
  inspection?: Inspection;
};

const initFormData: InspectionFormData = {
  project: undefined,
  dateRange: undefined,
  primaryOfficer: undefined,
  irTypes: [],
  initiation: undefined,
  irStatus: undefined,
  projectStatus: undefined,
  caseFileId: undefined,
};

const InspectionDrawer: React.FC<InspectionDrawerProps> = ({
  onSubmit,
  inspection,
  caseFile,
}) => {
  const { appHeaderHeight } = useMenuStore();

  const { data: initiationList } = useInitiationsData();
  const { data: irTypeList } = useIRTypesData();
  const { data: irStatusList } = useIRStatusesData();
  const { data: projectStatusList } = useProjectStatusesData();
  const { data: attendanceList } = useAttendanceOptionsData();
  const { data: agenciesList } = useAgenciesData();
  const { data: firstNationsList } = useFirstNationsData();
  const { data: inattendanceOfficersList } = useStaffUsersData(true)
  const currentUser = useCurrentLoggedInUser();

  const staffUserList = [
    caseFile.primary_officer,
    ...(caseFile.officers ?? []),
  ].filter(Boolean) as StaffUser[];

  const defaultValues = useMemo<InspectionFormData>(() => {
    if (inspection) {
      return {
        ...inspection,
        projectDescription: inspection.project_description ?? "",
        locationDescription: inspection.location_description,
        primaryOfficer: inspection.primary_officer,
        irStatus: inspection.ir_status,
        projectStatus: inspection.project_status,
        irTypes: inspection.types,
        dateRange: {
          startDate: dayjs(inspection.start_date),
          endDate: dayjs(inspection.end_date),
        },
        inAttendance: inspection.inspectionAttendances?.map(
          (item) => item.attendance_option
        ),
        agencies: inspection.inspectionAttendances?.find(
          (item) =>
            item.attendance_option_id === Number(AttendanceEnum.AGENCIES)
        )?.data,
        firstNations: inspection.inspectionAttendances?.find(
          (item) =>
            item.attendance_option_id === Number(AttendanceEnum.FIRST_NATIONS)
        )?.data,
        officers: inspection.inspectionAttendances?.find(
          (item) =>
            item.attendance_option_id === Number(AttendanceEnum.OFFICERS)
        )?.data,
        municipal: inspection.inspectionAttendances?.find(
          (item) =>
            item.attendance_option_id === Number(AttendanceEnum.MUNICIPAL)
        )?.data,
        other: inspection.inspectionAttendances?.find(
          (item) => item.attendance_option_id === Number(AttendanceEnum.OTHER)
        )?.data,
      };
    }
    const selectedOfficer = staffUserList.find(
      (user) => user.auth_user_guid === currentUser?.preferred_username
    );
    return {
      ...initFormData,
      caseFileId: caseFile.id?.toString(),
      primaryOfficer: selectedOfficer,
      projectDescription: caseFile.project_description,
    };
  }, [inspection, caseFile, staffUserList, currentUser?.preferred_username]);

  const methods = useForm<InspectionSchemaType>({
    resolver: yupResolver(InspectionFormSchema),
    mode: "onBlur",
    defaultValues,
  });

  const { handleSubmit, reset } = methods;

  const onSuccess = useCallback(
    (data: Inspection) => {
      onSubmit(
        inspection
          ? "Changes saved successfully!"
          : `Inspection File ${data.ir_number} was successfully created`
      );
      reset();
    },
    [inspection, onSubmit, reset]
  );

  const { mutate: createInspection } = useCreateInspection(onSuccess);
  const { mutate: updateInspection } = useUpdateInspection(onSuccess);

  const onSubmitHandler = useCallback(
    (formData: InspectionSchemaType) => {
      if (inspection) {
        // update existing inspection record
        const inspectionUpdateData = formatInspectionData(formData);
        updateInspection({
          id: inspection.id,
          inspection: inspectionUpdateData,
        });
      } else {
        const inspectionCreateData = formatInspectionData(
          formData,
          caseFile.id
        );
        createInspection(inspectionCreateData);
      }
    },
    [inspection, updateInspection, caseFile, createInspection]
  );

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmitHandler)}>
        <DrawerTitleBar
          title={inspection ? inspection.ir_number : "Create Inspection"}
          isFormDirtyCheck
        />
        <DrawerActionBarTop isShowActionBar={!inspection} />
        <Stack
          height={`calc(100vh - ${appHeaderHeight + 129}px)`} // 64px (DrawerTitleBar height) + 65px (DrawerActionBar height)
          direction={"row"}
        >
          <InspectionFormLeft
            initiationList={initiationList ?? []}
            staffUsersList={staffUserList ?? []}
            irTypeList={irTypeList ?? []}
            irStatusList={irStatusList ?? []}
            projectStatusList={projectStatusList ?? []}
          />
          <InspectionFormRight
            attendanceList={attendanceList ?? []}
            agenciesList={agenciesList ?? []}
            firstNationsList={firstNationsList ?? []}
            staffList={inattendanceOfficersList ?? []}
          />
        </Stack>
        <DrawerActionBarBottom isShowActionBar={!!inspection} />
      </form>
    </FormProvider>
  );
};

export default InspectionDrawer;
