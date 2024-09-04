import { useInitiationsData } from "@/hooks/useCaseFiles";
import { useStaffUsersData } from "@/hooks/useStaff";
import { useProjectsData } from "@/hooks/useProjects";
import { CaseFile } from "@/models/CaseFile";
import { Initiation } from "@/models/Initiation";
import { Project } from "@/models/Project";
import { StaffUser } from "@/models/Staff";
import { notify } from "@/store/snackbarStore";
import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Button, Stack } from "@mui/material";
import { AxiosError } from "axios";
import { BCDesignTokens } from "epic.theme";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import InspectionFormLeft from "./InspectionFormLeft";
import dateUtils from "@/utils/dateUtils";
import DrawerTitleBar from "@/components/Shared/Drawer/DrawerTitleBar";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useMenuStore } from "@/store/menuStore";
import { IRType } from "@/models/IRType";
import {
  useCreateInspection,
  useIRStatusesData,
  useIRTypesData,
  useProjectStatusesData,
} from "@/hooks/useInspections";
import { InspectionAPIData, InspectionFormData } from "@/models/Inspection";
import { UNAPPROVED_PROJECT_ID } from "@/utils/constants";
import { DateRange } from "@/models/DateRange";
import { IRStatus } from "@/models/IRStatus";
import { ProjectStatus } from "@/models/ProjectStatus";
import InspectionFormRight from "./InspectionFormRight";

type InspectionDrawerProps = {
  onSubmit: (submitMsg: string) => void;
  inspection?: CaseFile;
};

const inspectionFormSchema = yup.object().shape({
  project: yup.object<Project>().nullable().required("Project is required"),
  authorization: yup
    .string()
    .nullable()
    .when("isProjectDetailsDisabled", {
      is: true,
      then: (schema) => schema.nullable(),
      otherwise: (schema) => schema.required("Authorization is required"),
    }),
  certificateHolder: yup
    .string()
    .nullable()
    .when("isProjectDetailsDisabled", {
      is: true,
      then: (schema) => schema.nullable(),
      otherwise: (schema) => schema.required("Certificate Holder is required"),
    }),
  projectDescription: yup
    .string()
    .nullable()
    .when("isProjectDetailsDisabled", {
      is: true,
      then: (schema) => schema.nullable(),
      otherwise: (schema) => schema.required("Project Description is required"),
    }),
  locationDescription: yup.string().nullable(),
  utm: yup.string().nullable(),
  leadOfficer: yup
    .object<StaffUser>()
    .nullable()
    .required("Lead Officer is required"),
  officers: yup.array().of(yup.object<StaffUser>()).nullable(),
  irType: yup
    .array()
    .of(yup.object<IRType>())
    .min(1, "At least one Type is required")
    .required("Type is required"),
  dateRange: yup
    .object<DateRange>()
    .shape({
      startDate: yup
        .date()
        .required("Start date is required")
        .typeError("Invalid date"),
      endDate: yup
        .date()
        .required("End date is required")
        .typeError("Invalid date")
        .min(yup.ref("startDate"), "End date cannot be before start date"),
    })
    .test(
      "required",
      "Date is required",
      (value) => !!value?.startDate || !!value?.endDate
    )
    .nullable(),
  initiation: yup
    .object<Initiation>()
    .nullable()
    .required("Initiation is required"),
  irStatus: yup.object<IRStatus>().nullable(),
  projectStatus: yup.object<ProjectStatus>().nullable(),
  isProjectDetailsDisabled: yup.boolean().default(false),
});

type InspectionSchemaType = yup.InferType<typeof inspectionFormSchema>;

const initFormData: InspectionFormData = {
  project: undefined,
  dateRange: undefined,
  leadOfficer: undefined,
  officers: [],
  irType: [],
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

  const { data: projectList } = useProjectsData({ includeUnapproved: true });
  const { data: initiationList } = useInitiationsData();
  const { data: staffUserList } = useStaffUsersData();
  const { data: irTypeList } = useIRTypesData();
  const { data: irStatusList } = useIRStatusesData();
  const { data: projectStatusList } = useProjectStatusesData();

  const defaultValues = useMemo<InspectionFormData>(() => {
    if (inspection) {
      // TDOD: Map existing data
    }
    return initFormData;
  }, [inspection]);

  const methods = useForm<InspectionSchemaType>({
    resolver: yupResolver(inspectionFormSchema),
    mode: "onBlur",
    defaultValues,
  });

  const { handleSubmit, reset } = methods;

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const onSuccess = useCallback(() => {
    onSubmit(inspection ? "Successfully updated!" : "Successfully added!");
    reset();
  }, [inspection, onSubmit, reset]);

  const onError = useCallback((err: AxiosError) => {
    notify.error(err?.message);
  }, []);

  const { mutate: createInspection } = useCreateInspection(onSuccess, onError);

  const onSubmitHandler = useCallback(
    (data: InspectionSchemaType) => {
      // eslint-disable-next-line no-console
      console.log(data);
      const projectId = (data.project as Project)?.id ?? "";
      let inspectionData: InspectionAPIData = {
        project_id: projectId,
        ir_type_id: (data.irType[0] as IRType).id,
        initiation_id: (data.initiation as Initiation).id,
        start_date: dateUtils.dateToUTC(
          data.dateRange?.startDate ?? new Date()
        ),
        end_date: dateUtils.dateToUTC(data.dateRange?.endDate ?? new Date()),
        lead_officer_id: (data.leadOfficer as StaffUser)?.id,
        inspection_officer_ids:
          (data.officers as StaffUser[])?.map((user) => user.id) ?? [],
        case_file_id: 0,
        location_description: data.locationDescription ?? "",
        utm: data.utm ?? "",
      };
      if (projectId === UNAPPROVED_PROJECT_ID) {
        inspectionData = {
          unapproved_project_authorization: data.authorization ?? "",
          unapproved_project_proponent_name: data.certificateHolder ?? "",
          unapproved_project_description: data.projectDescription ?? "",
          ...inspectionData,
        };
      }
      if (inspection) {
        // TODO: Add update logic here
      } else {
        createInspection(inspectionData);
      }
    },
    [inspection, createInspection]
  );

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmitHandler)}>
        <Box ref={drawerTopRef}>
          <DrawerTitleBar title="Create Inspection Record" isFormDirtyCheck />
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
        </Box>

        <Stack
          height={`calc(100vh - ${(drawerTopRef.current?.offsetHeight ?? 120) + appHeaderHeight}px)`}
          direction={"row"}
        >
          <InspectionFormLeft
            projectList={projectList ?? []}
            initiationList={initiationList ?? []}
            staffUsersList={staffUserList ?? []}
            irTypeList={irTypeList ?? []}
          />
          <InspectionFormRight
            irStatusList={irStatusList ?? []}
            projectStatusList={projectStatusList ?? []}
          />
        </Stack>
      </form>
    </FormProvider>
  );
};

export default InspectionDrawer;
