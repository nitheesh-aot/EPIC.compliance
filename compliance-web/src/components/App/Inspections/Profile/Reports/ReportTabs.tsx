import { Box, Tabs, Tab, Typography, Button } from "@mui/material";
import { useEffect, useState, useMemo, useRef } from "react";
import ReportPanel from "./ReportPanel";
import { BCDesignTokens } from "epic.theme";
import { PictureAsPdfOutlined, SendRounded } from "@mui/icons-material";
import Overview from "./ReportTabContents/IROverview/Overview";
import { useReportStore } from "./reportStore";
import { useParams } from "@tanstack/react-router";
import InspectionSummary from "./ReportTabContents/InspectionSummary";
import ActionsRequired from "./ReportTabContents/ActionsRequired";
import InspectionDates from "./ReportTabContents/InspectionDates";
import IREnforcementSummary from "./ReportTabContents/IREnforcementSummary";
import IRAppendices from "./ReportTabContents/IRAppendices";
import { useInspectionByNumber } from "@/hooks/useInspections";
import { useInspectionRequirementsData } from "@/hooks/useInspectionRequirements";
import {
  REQUIREMENT_TYPE_ID,
  REGULATORY_CONSIDERATION_TYPE_ID,
} from "@/components/App/Inspections/Profile/Requirements/RequirementUtils";
import { InspectionRequirement } from "@/models/InspectionRequirement";
import IRRequirement from "./ReportTabContents/IRRequirement";
import IRRegulatoryConsideration from "./ReportTabContents/IRRegulatoryConsideration";
import { useCaseFileByNumber } from "@/hooks/useCaseFiles";
import { useModal } from "@/store/modalStore";
import SendForApprovalModal from "./SendForApprovalModal";
import { notify } from "@/store/snackbarStore";
import { IR_APPROVAL_STATUS, STAFF_USER_POSITION } from "@/utils/constants";
import { useStaffUsersData } from "@/hooks/useStaff";
import { useUpdateIRApprovalStatus } from "@/hooks/useInspectionReports";
import { useCurrentLoggedInUser } from "@/hooks/useAuthorization";
import { IRApproval } from "@/models/IRApproval";

export default function ReportTabs() {
  const { inspectionNumber } = useParams({ strict: false });
  const [value, setValue] = useState(0);
  const {
    inspectionRequirements,
    inspectionReportsData,
    irApprovalsData,
    setInspectionData,
    setInspectionRequirements,
    setInspectionRegulatoryConsideration,
    setCaseFileData,
    setIRApprovalsData,
  } = useReportStore();
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const { setOpen, setClose } = useModal();

  const currentUser = useCurrentLoggedInUser();
  const { data: inspectionData } = useInspectionByNumber(inspectionNumber);
  const { data: caseFileData } = useCaseFileByNumber(
    inspectionData?.case_file.case_file_number || ""
  );
  const { data: inspectionRequirementsData } = useInspectionRequirementsData(
    inspectionData?.id || 0
  );
  const { data: staffData } = useStaffUsersData();

  const isCurrentUserApprover = useMemo(() => {
    return staffData?.some(
      (staff) =>
        staff.auth_user_guid === currentUser?.preferred_username &&
        [
          STAFF_USER_POSITION.DEPUTY_DIRECTOR,
          STAFF_USER_POSITION.DIRECTOR,
        ].includes(staff.position_id ?? 0)
    );
  }, [staffData, currentUser]);

  useEffect(() => {
    if (inspectionData && caseFileData) {
      setInspectionData(inspectionData);
      setCaseFileData(caseFileData);
      setInspectionRequirements(
        inspectionRequirementsData?.filter(
          (req) => req.req_type?.id === REQUIREMENT_TYPE_ID
        ) ?? []
      );
      setInspectionRegulatoryConsideration(
        inspectionRequirementsData?.find(
          (req) => req.req_type?.id === REGULATORY_CONSIDERATION_TYPE_ID
        ) ?? undefined
      );
    }
  }, [
    inspectionData,
    caseFileData,
    inspectionRequirementsData,
    setInspectionData,
    setInspectionRequirements,
    setInspectionRegulatoryConsideration,
    setCaseFileData,
  ]);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const tabItems = useMemo(() => {
    // Base tabs that are always present
    const baseTabs = [
      { title: "IR Overview", component: <Overview /> },
      { title: "Inspection Summary", component: <InspectionSummary /> },
    ];

    // Dynamic requirement tabs based on inspectionRequirements
    const requirementTabs =
      inspectionRequirements?.map((req: InspectionRequirement, index) => ({
        title: `#${index + 1}. ${req.summary}`,
        component: <IRRequirement requirement={req} requirementIndex={index} />,
      })) ?? [];

    // Remaining static tabs
    const remainingTabs = [
      {
        title: "Actions Required by Regulated Party and Additional Comments",
        component: <ActionsRequired />,
      },
      { title: "Enforcement Summary", component: <IREnforcementSummary /> },
      {
        title: "Regulatory Consideration",
        component: <IRRegulatoryConsideration />,
      },
      { title: "Inspection Version Dates", component: <InspectionDates /> },
      { title: "Appendices", component: <IRAppendices /> },
    ];

    return [...baseTabs, ...requirementTabs, ...remainingTabs];
  }, [inspectionRequirements]);

  useEffect(() => {
    // Calculate and set the top position of tabs as a CSS variable
    const calculateTabsPosition = () => {
      const tabsContainer = tabsContainerRef.current;
      if (tabsContainer) {
        const rect = tabsContainer.getBoundingClientRect();
        document.documentElement.style.setProperty(
          "--ir-tabs-container-top-position",
          `${rect.top + 22}px` // 22px is the bottom misc padding
        );
      }
    };

    // Calculate on initial render and window resize
    calculateTabsPosition();
    window.addEventListener("resize", calculateTabsPosition);

    return () => {
      window.removeEventListener("resize", calculateTabsPosition);
    };
  }, []);

  const handleSendForApproval = () => {
    setOpen({
      content: (
        <SendForApprovalModal
          staffUsers={staffData ?? []}
          onSubmit={(message) => {
            notify.success(message);
            setClose();
          }}
        />
      ),
    });
  };

  const onSuccess = (data: IRApproval) => {
    setIRApprovalsData([data]);
    notify.success("Approval status updated");
  };

  const { mutate: updateIRApprovalStatus } =
    useUpdateIRApprovalStatus(onSuccess);

  const handleApproval = (isApprove: boolean) => {
    const currentUserId =
      staffData?.find(
        (staff) => staff.auth_user_guid === currentUser?.preferred_username
      )?.id ?? 0;
    updateIRApprovalStatus({
      inspectionId: inspectionData?.id ?? 0,
      inspectionRecordId: inspectionReportsData?.id ?? 0,
      approvalId: irApprovalsData?.[0]?.id ?? 0,
      statusPayload: {
        approval_status: isApprove
          ? IR_APPROVAL_STATUS.APPROVED
          : IR_APPROVAL_STATUS.NOT_APPROVED,
        approved_by_id: currentUserId,
      },
    });
  };

  const isShowApprovalButton = useMemo(() => {
    if (!irApprovalsData) return false;
    return (
      irApprovalsData?.length &&
      irApprovalsData[0].approval_status === IR_APPROVAL_STATUS.DECISION_PENDING
    );
  }, [irApprovalsData]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", pt: 3 }}>
      <Box
        sx={{
          mb: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">Preliminary IR</Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {!isCurrentUserApprover && (
            <Button
              variant="text"
              color="primary"
              onClick={handleSendForApproval}
              disabled={!!isShowApprovalButton}
            >
              <SendRounded sx={{ mr: 0.5, fontSize: 20 }} />
              Send for Approval
            </Button>
          )}
          {isCurrentUserApprover && isShowApprovalButton ? (
            <>
              <Button
                color="secondary"
                size="small"
                onClick={() => handleApproval(true)}
              >
                Approve
              </Button>
              <Button
                color="secondary"
                size="small"
                onClick={() => handleApproval(false)}
              >
                Not Approve
              </Button>
            </>
          ) : null}
          <Button variant="text" color="primary">
            <PictureAsPdfOutlined sx={{ mr: 1, fontSize: 20 }} />
            Preview
          </Button>
        </Box>
      </Box>
      <Box
        ref={tabsContainerRef}
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "row",
          width: "100%",
          gap: 2,
          height: "calc(100vh - var(--ir-tabs-container-top-position))",
          position: "relative",
        }}
      >
        <Tabs
          orientation="vertical"
          variant="scrollable"
          scrollButtons={false}
          value={value}
          onChange={handleChange}
          TabIndicatorProps={{
            sx: {
              backgroundColor: "transparent",
            },
          }}
          aria-label="preliminary ir tabs"
          sx={{
            width: "30%",
            height: "100%",
            "& .MuiTabs-flexContainer": {
              gap: 2,
            },
            "& .MuiTab-root": {
              borderRadius: 1,
              border: `1px solid ${BCDesignTokens.surfaceColorBorderDefault}`,
              height: "40px",
              py: 0,
              minHeight: "unset",
            },
            "& .Mui-selected": {
              borderColor: BCDesignTokens.surfaceColorBorderActive,
              color: BCDesignTokens.themePrimaryBlue,
              backgroundColor: BCDesignTokens.surfaceColorBackgroundLightBlue,
            },
          }}
        >
          {tabItems.map((item, index) => (
            <Tab
              key={`tab-${index}`}
              label={
                <Box
                  sx={{
                    width: "100%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    display: "inline-block",
                    textAlign: "start",
                  }}
                >
                  {item.title}
                </Box>
              }
              id={`ir-tab-${index}`}
              aria-controls={`ir-tabpanel-${index}`}
              sx={{ width: "100%" }}
            />
          ))}
        </Tabs>
        {tabItems.map((item, index) => (
          <ReportPanel key={`panel-${index}`} value={value} index={index}>
            {item.component}
          </ReportPanel>
        ))}
      </Box>
    </Box>
  );
}
