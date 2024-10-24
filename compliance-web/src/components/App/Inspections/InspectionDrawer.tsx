import { useStaffUsersData } from "@/hooks/useStaff";
import { useProjectsData } from "@/hooks/useProjects";
import { StaffUser } from "@/models/Staff";
import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Stack } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import InspectionFormLeft from "./InspectionFormLeft";
import DrawerTitleBar from "@/components/Shared/Drawer/DrawerTitleBar";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useMenuStore } from "@/store/menuStore";
import {
  useAttendanceOptionsData,
  useCreateInspection,
  useInitiationsData,
  useIRStatusesData,
  useIRTypesData,
  useProjectStatusesData,
  useUpdateInspection,
} from "@/hooks/useInspections";
import {
  Inspection,
  InspectionAPIData,
  InspectionFormData,
} from "@/models/Inspection";
import InspectionFormRight from "./InspectionFormRight";
import { useModal } from "@/store/modalStore";
import LinkCaseFileModal from "@/components/App/CaseFiles/LinkCaseFileModal";
import { useAgenciesData } from "@/hooks/useAgencies";
import { useFirstNationsData } from "@/hooks/useFirstNations";
import {
  AttendanceEnum,
  formatInspectionData,
  getProjectId,
  InspectionFormSchema,
  InspectionSchemaType,
} from "./InspectionFormUtils";
import { INITIATION } from "@/utils/constants";
import dayjs from "dayjs";
import { formatAuthorization } from "@/utils/appUtils";
import DrawerActionBarTop from "@/components/Shared/Drawer/DrawerActionBarTop";
import DrawerActionBarBottom from "@/components/Shared/Drawer/DrawerActionBarBottom";

type InspectionDrawerProps = {
  onSubmit: (submitMsg: string) => void;
  inspection?: Inspection;
};

const initFormData: InspectionFormData = {
  project: undefined,
  dateRange: undefined,
  primaryOfficer: undefined,
  officers: [],
  irTypes: [],
  initiation: undefined,
  irStatus: undefined,
  projectStatus: undefined,
  caseFileId: undefined,
};

const InspectionDrawer: React.FC<InspectionDrawerProps> = ({
  onSubmit,
  inspection,
}) => {
  const { appHeaderHeight } = useMenuStore();
  const drawerTopRef = useRef<HTMLDivElement | null>(null);

  const { setOpen: setModalOpen, setClose: setModalClose } = useModal();

  const { data: projectList } = useProjectsData({ includeUnapproved: true });
  const { data: initiationList } = useInitiationsData();
  const { data: staffUserList } = useStaffUsersData();
  const { data: irTypeList } = useIRTypesData();
  const { data: irStatusList } = useIRStatusesData();
  const { data: projectStatusList } = useProjectStatusesData();
  const { data: attendanceList } = useAttendanceOptionsData();
  const { data: agenciesList } = useAgenciesData();
  const { data: firstNationsList } = useFirstNationsData();

  const defaultValues = useMemo<InspectionFormData>(() => {
    if (inspection) {
      return {
        ...inspection,
        authorization: formatAuthorization(inspection.authorization),
        regulatedParty: inspection.regulated_party,
        projectDescription: inspection.project_description ?? "",
        projectType: inspection.type,
        projectSubType: inspection.sub_type,
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
        municipal: inspection.inspectionAttendances?.find(
          (item) =>
            item.attendance_option_id === Number(AttendanceEnum.MUNICIPAL)
        )?.data,
        other: inspection.inspectionAttendances?.find(
          (item) => item.attendance_option_id === Number(AttendanceEnum.OTHER)
        )?.data,
      };
    }
    return initFormData;
  }, [inspection]);

  const methods = useForm<InspectionSchemaType>({
    resolver: yupResolver(InspectionFormSchema),
    mode: "onBlur",
    defaultValues,
  });

  const { handleSubmit, reset, getValues } = methods;

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

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

  const handleOnCaseFileSubmit = useCallback(
    (caseFileId: number) => {
      const formData = getValues();
      const inspectionCreateData: InspectionAPIData = formatInspectionData(
        formData,
        caseFileId
      );
      createInspection(inspectionCreateData);
      setModalClose();
    },
    [createInspection, getValues, setModalClose]
  );

  const onSubmitHandler = useCallback(
    (data: InspectionSchemaType) => {
      if (inspection) {
        // update existing inspection record
        const formData = getValues();
        const inspectionUpdateData: InspectionAPIData =
          formatInspectionData(formData);
        updateInspection({
          id: inspection.id,
          inspection: inspectionUpdateData,
        });
      } else {
        // Open modal for linking or creating case file during create new inspection record
        setModalOpen({
          content: (
            <LinkCaseFileModal
              onSubmit={handleOnCaseFileSubmit}
              projectId={getProjectId(data)}
              primaryOfficerId={(data.primaryOfficer as StaffUser).id}
              initiationId={INITIATION.INSPECTION_ID}
            />
          ),
        });
      }
    },
    [
      inspection,
      getValues,
      updateInspection,
      setModalOpen,
      handleOnCaseFileSubmit,
    ]
  );

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmitHandler)}>
        <Box ref={drawerTopRef}>
          <DrawerTitleBar
            title={inspection ? inspection.ir_number : "Create Inspection"}
            isFormDirtyCheck
          />
          <DrawerActionBarTop isShowActionBar={!inspection} />
        </Box>
        <Stack
          height={`calc(100vh - ${appHeaderHeight + 129}px)`} // 64px (DrawerTitleBar height) + 65px (DrawerActionBar height)
          direction={"row"}
        >
          <InspectionFormLeft
            projectList={projectList ?? []}
            initiationList={initiationList ?? []}
            staffUsersList={staffUserList ?? []}
            irTypeList={irTypeList ?? []}
            isEditMode={!!inspection}
          />
          <InspectionFormRight
            irStatusList={irStatusList ?? []}
            projectStatusList={projectStatusList ?? []}
            attendanceList={attendanceList ?? []}
            agenciesList={agenciesList ?? []}
            firstNationsList={firstNationsList ?? []}
          />
        </Stack>
        <DrawerActionBarBottom isShowActionBar={!!inspection} />
      </form>
    </FormProvider>
  );
};

export default InspectionDrawer;
