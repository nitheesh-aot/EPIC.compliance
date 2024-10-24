import { useStaffUsersData } from "@/hooks/useStaff";
import { useProjectsData } from "@/hooks/useProjects";
import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Button, Stack } from "@mui/material";
import { BCDesignTokens } from "epic.theme";
import { FormProvider, useForm } from "react-hook-form";
import ComplaintFormLeft from "./ComplaintFormLeft";
import DrawerTitleBar from "@/components/Shared/Drawer/DrawerTitleBar";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useMenuStore } from "@/store/menuStore";
import { InspectionFormData as ComplaintFormData } from "@/models/Inspection";
import { useModal } from "@/store/modalStore";
import {
  formatComplaintData,
  getProjectId,
  ComplaintFormSchema,
  ComplaintSchemaType,
} from "./ComplaintFormUtils";
import LinkCaseFileModal from "@/components/App/CaseFiles/LinkCaseFileModal";
import { Complaint, ComplaintAPIData } from "@/models/Complaint";
import {
  useComplaintSourcesData,
  useCreateComplaint,
  useRequirementSourcesData,
} from "@/hooks/useComplaints";
import { useAgenciesData } from "@/hooks/useAgencies";
import { useFirstNationsData } from "@/hooks/useFirstNations";
import { useTopicsData } from "@/hooks/useTopics";
import ComplaintSourceForm from "./ComplaintSourceForm";
import RequirementSourceForm from "./RequirementSourceForm";
import { INITIATION } from "@/utils/constants";
import { StaffUser } from "@/models/Staff";

type ComplaintDrawerProps = {
  onSubmit: (submitMsg: string) => void;
  complaint?: Complaint;
};

const initFormData: ComplaintFormData = {
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

const ComplaintDrawer: React.FC<ComplaintDrawerProps> = ({
  onSubmit,
  complaint,
}) => {
  const { appHeaderHeight } = useMenuStore();
  const drawerTopRef = useRef<HTMLDivElement | null>(null);

  const { setOpen: setModalOpen, setClose: setModalClose } = useModal();

  const { data: projectList } = useProjectsData({ includeUnapproved: true });
  const { data: staffUserList } = useStaffUsersData();
  const { data: complaintSourceList } = useComplaintSourcesData();
  const { data: requirementSourceList } = useRequirementSourcesData();
  const { data: agenciesList } = useAgenciesData();
  const { data: firstNationsList } = useFirstNationsData();
  const { data: topicsList } = useTopicsData();

  const defaultValues = useMemo<ComplaintFormData>(() => {
    if (complaint) {
      // TDOD: Map existing data
    }
    return initFormData;
  }, [complaint]);

  const methods = useForm<ComplaintSchemaType>({
    resolver: yupResolver(ComplaintFormSchema),
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
    (data: Complaint) => {
      onSubmit(
        complaint
          ? "Successfully updated!"
          : `Complaint File ${data.complaint_number} was successfully created`
      );
      reset();
    },
    [complaint, onSubmit, reset]
  );

  const { mutate: createComplaint } = useCreateComplaint(onSuccess);

  const addOrUpdateComplaint = useCallback(
    (caseFileId: number) => {
      const formData = getValues();
      const complaintData: ComplaintAPIData = formatComplaintData(
        formData,
        caseFileId
      );

      if (complaint) {
        // TODO: Add update logic here
      } else {
        createComplaint(complaintData);
      }
    },
    [createComplaint, getValues, complaint]
  );

  const handleOnCaseFileSubmit = useCallback(
    (caseFileId: number) => {
      addOrUpdateComplaint(caseFileId);
      setModalClose();
    },
    [addOrUpdateComplaint, setModalClose]
  );

  const onSubmitHandler = useCallback(
    (data: ComplaintSchemaType) => {
      // Open modal for linking or creating case file
      setModalOpen({
        content: (
          <LinkCaseFileModal
            onSubmit={handleOnCaseFileSubmit}
            projectId={getProjectId(data)}
            primaryOfficerId={(data.primaryOfficer as StaffUser).id}
            initiationId={INITIATION.COMPLAINTS_ID}
          />
        ),
      });
    },
    [setModalOpen, handleOnCaseFileSubmit]
  );

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmitHandler)}>
        <Box ref={drawerTopRef}>
          <DrawerTitleBar title="Create Complaint" isFormDirtyCheck />
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
          direction="row"
        >
          <ComplaintFormLeft
            projectList={projectList ?? []}
            staffUsersList={staffUserList ?? []}
          />
          <Box
            sx={{
              width: "399px",
              boxSizing: "border-box",
              overflow: "auto",
            }}
          >
            <ComplaintSourceForm
              complaintSourceList={complaintSourceList ?? []}
              agenciesList={agenciesList ?? []}
              firstNationsList={firstNationsList ?? []}
            />
            <RequirementSourceForm
              requirementSourceList={requirementSourceList ?? []}
              topicsList={topicsList ?? []}
            />
          </Box>
        </Stack>
      </form>
    </FormProvider>
  );
};

export default ComplaintDrawer;
