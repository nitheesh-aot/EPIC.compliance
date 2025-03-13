import { Box, Tabs, Tab, Typography, Button, Tooltip } from "@mui/material";
import { useEffect, useState, useMemo, useRef } from "react";
import ReportPanel from "./ReportPanel";
import { BCDesignTokens } from "epic.theme";
import { PictureAsPdfOutlined, SendRounded } from "@mui/icons-material";
import Overview from "./ReportTabContents/IROverview/Overview";
import { useReportStore } from "./reportStore";
import { useParams } from "@tanstack/react-router";
import InspectionSummary from "./ReportTabContents/InspectionSummary";
import ActionsRequired from "./ReportTabContents/ActionsRequired";
import EnforcementSummary from "./ReportTabContents/EnforcementSummary";
import InspectionDates from "./ReportTabContents/InspectionDates";
import { useInspectionByNumber } from "@/hooks/useInspections";
import Appendices from "./ReportTabContents/Appendices";
import { useInspectionRequirementsData } from "@/hooks/useInspectionRequirements";
import {
  REQUIREMENT_TYPE_ID,
  REGULATORY_CONSIDERATION_TYPE_ID,
} from "@/components/App/Inspections/Profile/Requirements/RequirementUtils";
import { InspectionRequirement } from "@/models/InspectionRequirement";
import IRRequirement from "./ReportTabContents/IRRequirement";
import IRRegulatoryConsideration from "./ReportTabContents/IRRegulatoryConsideration";
import { useCaseFileByNumber } from "@/hooks/useCaseFiles";

export default function ReportTabs() {
  const { inspectionNumber } = useParams({ strict: false });
  const [value, setValue] = useState(0);
  const {
    setInspectionData,
    setInspectionSummary,
    setActionsRequired,
    setInspectionRequirements,
    setInspectionRegulatoryConsideration,
    setCaseFileData,
    inspectionRequirements,
  } = useReportStore();
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  const { data: inspectionData } = useInspectionByNumber(inspectionNumber);
  const { data: caseFileData } = useCaseFileByNumber(
    inspectionData?.case_file.case_file_number || ""
  );
  const { data: inspectionRequirementsData } = useInspectionRequirementsData(
    inspectionData?.id || 0
  );

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

      setInspectionSummary(
        `<p class="editor-paragraph" dir="ltr"><span style="white-space: pre-wrap;">The Officer inspected </span><i><em class="editor-text-italic" style="white-space: pre-wrap;">[BRIEF DESCRIPTION OF PROJECT COMPONENTS/AREAS INSPECTED] </em></i></p><p class="editor-paragraph"><br></p><p class="editor-paragraph" dir="ltr"><span style="white-space: pre-wrap;">The inspection included a debrief of observations with Project staff on </span><b><strong class="editor-text-bold" style="white-space: pre-wrap;">January 17, 2025.</strong></b><span style="white-space: pre-wrap;"> The following requirements were inspected against: </span></p><p class="editor-paragraph"><br></p><ol class="editor-list-ol"><li value="1" class="editor-listitem"><span style="white-space: pre-wrap;">Condition 7 of Schedule B with respect to providing a non-compliance notification to the EAO. </span></li><li value="2" class="editor-listitem"><span style="white-space: pre-wrap;">Condition 14 of Schedule B with respect to hazardous materials and fuel storage. </span></li><li value="3" class="editor-listitem"><span style="white-space: pre-wrap;">Condition 5 of Schedule B with respect to storage of suspect PAG materials.</span></li></ol>`
      );
      setActionsRequired(
        `<p class="editor-paragraph" dir="ltr"><b><strong class="editor-text-bold" style="white-space: pre-wrap;">Please review this inspection record for errors or omissions and provide a response to Officer Lombardi by</strong></b><span style="white-space: pre-wrap;"> </span><i><em class="editor-text-italic" style="white-space: pre-wrap;">date will appear once due date is set.</em></i></p>`
      );
    }
  }, [
    inspectionData,
    caseFileData,
    inspectionRequirementsData,
    setInspectionData,
    setInspectionSummary,
    setActionsRequired,
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
        component: <IRRequirement requirement={req} />,
      })) ?? [];

    // Remaining static tabs
    const remainingTabs = [
      {
        title: "Actions Required by Regulated Party and Additional Comments",
        component: <ActionsRequired />,
      },
      { title: "Enforcement Summary", component: <EnforcementSummary /> },
      {
        title: "Regulatory Consideration",
        component: <IRRegulatoryConsideration />,
      },
      { title: "Inspection Version Dates", component: <InspectionDates /> },
      { title: "Appendices", component: <Appendices /> },
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
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="text" color="primary">
            <SendRounded sx={{ mr: 1, fontSize: 20 }} />
            Send for Approval
          </Button>
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
              key={index}
              label={
                <Tooltip title={item.title}>
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
                </Tooltip>
              }
              id={`ir-tab-${index}`}
              aria-controls={`ir-tabpanel-${index}`}
              sx={{ width: "100%" }}
            />
          ))}
        </Tabs>
        {tabItems.map((item, index) => (
          <ReportPanel key={index} value={value} index={index}>
            {item.component}
          </ReportPanel>
        ))}
      </Box>
    </Box>
  );
}
