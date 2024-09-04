import { useCreateCaseFile, useInitiationsData } from "@/hooks/useCaseFiles";
import { useStaffUsersData } from "@/hooks/useStaff";
import { useProjectsData } from "@/hooks/useProjects";
import { CaseFile, CaseFileAPIData, CaseFileFormData } from "@/models/CaseFile";
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
import ComingSoon from "@/components/Shared/ComingSoon";
import { useMenuStore } from "@/store/menuStore";
import { IRType } from "@/models/IRType";
import { useIRTypesData } from "@/hooks/useInspections";

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
    .nullable()
    .required("Type is required"),
  dateCreated: yup.date().nullable(),
  dateRange: yup.object().shape({
    startDate: yup
      .date()
      .required("Start date is required")
      .typeError("Invalid date"),
    endDate: yup
      .date()
      .required("End date is required")
      .typeError("Invalid date")
      .min(yup.ref("startDate"), "End date cannot be before start date"),
  }),
  initiation: yup
    .object<Initiation>()
    .nullable()
    .required("Initiation is required"),
  isProjectDetailsDisabled: yup.boolean().default(false),
});

type InspectionSchemaType = yup.InferType<typeof inspectionFormSchema>;

const initFormData: CaseFileFormData = {
  project: undefined,
  dateCreated: undefined,
  leadOfficer: undefined,
  officers: [],
  initiation: undefined,
  caseFileNumber: undefined,
};

const InspectionDrawer: React.FC<InspectionDrawerProps> = ({
  onSubmit,
  inspection,
}) => {
  const { appHeaderHeight } = useMenuStore();
  const drawerTopRef = useRef<HTMLDivElement | null>(null);

  const { data: projectList } = useProjectsData();
  const { data: initiationList } = useInitiationsData();
  const { data: staffUserList } = useStaffUsersData();
  const { data: irTypeList } = useIRTypesData();

  const defaultValues = useMemo<CaseFileFormData>(() => {
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

  const { mutate: createCaseFile } = useCreateCaseFile(onSuccess, onError);

  const onSubmitHandler = useCallback(
    (data: InspectionSchemaType) => {
      // eslint-disable-next-line no-console
      console.log(data);
      const caseFileData: CaseFileAPIData = {
        project_id: (data.project as Project)?.id ?? "",
        date_created: dateUtils.dateToUTC(data.dateCreated ?? new Date()),
        initiation_id: (data.initiation as Initiation).id,
        case_file_number: "",
        lead_officer_id: (data.leadOfficer as StaffUser)?.id,
        officer_ids:
          (data.officers as StaffUser[])?.map((user) => user.id) ?? [],
      };
      if (inspection) {
        // TODO: Add update logic here
      } else {
        createCaseFile(caseFileData);
      }
    },
    [inspection, createCaseFile]
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
          ></InspectionFormLeft>
          <Box
            sx={{
              width: "399px",
              boxSizing: "border-box",
              overflow: "auto",
            }}
          >
            <ComingSoon />
          </Box>
        </Stack>
      </form>
    </FormProvider>
  );
};

export default InspectionDrawer;
