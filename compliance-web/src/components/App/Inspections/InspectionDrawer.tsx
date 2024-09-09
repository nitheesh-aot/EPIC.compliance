import { useStaffUsersData } from "@/hooks/useStaff";
import { useProjectsData } from "@/hooks/useProjects";
import { CaseFile, CaseFileAPIData } from "@/models/CaseFile";
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
  useInitiationsData,
  useIRStatusesData,
  useIRTypesData,
  useProjectStatusesData,
} from "@/hooks/useInspections";
import {
  Inspection,
  InspectionAPIData,
  InspectionFormData,
} from "@/models/Inspection";
import { UNAPPROVED_PROJECT_ID } from "@/utils/constants";
import { DateRange } from "@/models/DateRange";
import { IRStatus } from "@/models/IRStatus";
import { ProjectStatus } from "@/models/ProjectStatus";
import InspectionFormRight from "./InspectionFormRight";
import { useModal } from "@/store/modalStore";
import LinkCaseFileModal from "./LinkCaseFileModal";

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
      then: (schema) => schema.notRequired(),
      otherwise: (schema) => schema.required("Authorization is required"),
    }),
  certificateHolder: yup
    .string()
    .nullable()
    .when("isProjectDetailsDisabled", {
      is: true,
      then: (schema) => schema.notRequired(),
      otherwise: (schema) => schema.required("Certificate Holder is required"),
    }),
  projectDescription: yup
    .string()
    .nullable()
    .when("isProjectDetailsDisabled", {
      is: true,
      then: (schema) => schema.notRequired(),
      otherwise: (schema) => schema.required("Project Description is required"),
    }),
  locationDescription: yup.string().nullable(),
  utm: yup.string().nullable(),
  leadOfficer: yup
    .object<StaffUser>()
    .nullable()
    .required("Lead Officer is required"),
  officers: yup.array().of(yup.object<StaffUser>()).nullable(),
  irTypes: yup
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

  const {
    handleSubmit,
    reset,
    formState: { isValid },
    getValues,
  } = methods;

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const onSuccess = useCallback(
    (data: Inspection) => {
      onSubmit(
        inspection
          ? "Successfully updated!"
          : `Inspection File ${data.ir_number} was successfully created`
      );
      reset();
    },
    [inspection, onSubmit, reset]
  );

  const onError = useCallback((err: AxiosError) => {
    notify.error(err?.message);
  }, []);

  const { mutate: createInspection } = useCreateInspection(onSuccess, onError);

  const getProjectId = (formData: InspectionSchemaType) => {
    const projectId = (formData.project as Project)?.id ?? "";
    return projectId === UNAPPROVED_PROJECT_ID ? undefined : projectId;
  };

  const addOrUpdateInspection = useCallback(
    (caseFileId: number) => {
      const formData = getValues();
      const projectId = getProjectId(formData);

      let inspectionData: InspectionAPIData = {
        project_id: projectId,
        case_file_id: caseFileId,
        inspection_type_ids:
          (formData.irTypes as IRType[])?.map((ir) => ir.id) ?? [],
        initiation_id: (formData.initiation as Initiation).id,
        start_date: dateUtils.dateToISO(
          formData.dateRange?.startDate ?? new Date()
        ),
        end_date: dateUtils.dateToISO(
          formData.dateRange?.endDate ?? new Date()
        ),
        lead_officer_id: (formData.leadOfficer as StaffUser)?.id,
        inspection_officer_ids:
          (formData.officers as StaffUser[])?.map((user) => user.id) ?? [],
        location_description: formData.locationDescription ?? "",
        utm: formData.utm ?? "",
        ir_status_id: (formData.irStatus as IRStatus)?.id,
        project_status_id: (formData.projectStatus as ProjectStatus)?.id,
      };
      if (!projectId) {
        inspectionData = {
          unapproved_project_authorization: formData.authorization ?? "",
          unapproved_project_proponent_name: formData.certificateHolder ?? "",
          unapproved_project_description: formData.projectDescription ?? "",
          ...inspectionData,
        };
      }

      if (inspection) {
        // TODO: Add update logic here
      } else {
        createInspection(inspectionData);
      }
    },
    [createInspection, getValues, inspection]
  );

  const handleOnCaseFileSubmit = useCallback(
    (caseFileId: number) => {
      addOrUpdateInspection(caseFileId);
      setModalClose();
    },
    [addOrUpdateInspection, setModalClose]
  );

  const onSubmitHandler = useCallback(
    (data: InspectionSchemaType) => {
      const caseFileData: CaseFileAPIData = {
        project_id: getProjectId(data),
        date_created: dateUtils.dateToISO(
          data.dateRange?.startDate ?? new Date()
        ),
        initiation_id: "", // should be mapped from the case file modal
        case_file_number: "",
        lead_officer_id: (data.leadOfficer as StaffUser)?.id,
        officer_ids:
          (data.officers as StaffUser[])?.map((user) => user.id) ?? [],
      };

      // Open modal for linking or creating case file
      setModalOpen({
        content: (
          <LinkCaseFileModal
            onSubmit={handleOnCaseFileSubmit}
            caseFileData={caseFileData}
          />
        ),
        width: "400px",
      });
    },
    [setModalOpen, handleOnCaseFileSubmit]
  );

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmitHandler)}>
        <Box ref={drawerTopRef}>
          <DrawerTitleBar title="Create Inspection" isFormDirtyCheck />
          <Box
            sx={{
              backgroundColor: BCDesignTokens.surfaceColorBackgroundLightGray,
              padding: "0.75rem 2rem",
              textAlign: "right",
            }}
          >
            <Button type="submit" disabled={!isValid}>
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
