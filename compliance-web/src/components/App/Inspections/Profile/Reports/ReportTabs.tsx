import { Box, Tabs, Tab, Typography, Button } from "@mui/material";
import { useEffect, useState } from "react";
import ReportPanel from "./ReportPanel";
import { BCDesignTokens } from "epic.theme";
import { PictureAsPdfOutlined, SendRounded } from "@mui/icons-material";
import Overview from "./ReportTabContents/IROverview/Overview";
import { useReportStore } from "./reportStore";
import { useQueryClient } from "@tanstack/react-query";
import { Inspection } from "@/models/Inspection";
import { useParams } from "@tanstack/react-router";
import InspectionSummary from "./ReportTabContents/InspectionSummary";

function a11yProps(index: number) {
  return {
    id: `ir-tab-${index}`,
    "aria-controls": `ir-tabpanel-${index}`,
  };
}

export default function ReportTabs() {
  const queryClient = useQueryClient();
  const { inspectionNumber } = useParams({ strict: false });
  const [value, setValue] = useState(0);
  const { setInspectionData, setInspectionSummary } = useReportStore();

  const inspectionData = queryClient.getQueryData<Inspection>([
    "inspection",
    inspectionNumber,
  ]);

  useEffect(() => {
    if (inspectionData) {
      setInspectionData(inspectionData);
      setInspectionSummary(
        `<p class="editor-paragraph" dir="ltr"><span style="white-space: pre-wrap;">The Officer inspected </span><i><em class="editor-text-italic" style="white-space: pre-wrap;">[BRIEF DESCRIPTION OF PROJECT COMPONENTS/AREAS INSPECTED] </em></i></p><p class="editor-paragraph"><br></p><p class="editor-paragraph" dir="ltr"><span style="white-space: pre-wrap;">The inspection included a debrief of observations with Project staff on </span><b><strong class="editor-text-bold" style="white-space: pre-wrap;">January 17, 2025.</strong></b><span style="white-space: pre-wrap;"> The following requirements were inspected against: </span></p><p class="editor-paragraph"><br></p><ol class="editor-list-ol"><li value="1" class="editor-listitem"><span style="white-space: pre-wrap;">Condition 7 of Schedule B with respect to providing a non-compliance notification to the EAO. </span></li><li value="2" class="editor-listitem"><span style="white-space: pre-wrap;">Condition 14 of Schedule B with respect to hazardous materials and fuel storage. </span></li><li value="3" class="editor-listitem"><span style="white-space: pre-wrap;">Condition 5 of Schedule B with respect to storage of suspect PAG materials.</span></li></ol>`
      );
    }
  }, [inspectionData, setInspectionData, setInspectionSummary]);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const tabItems = [
    { title: "IR Overview", component: <Overview /> },
    { title: "Inspection Summary", component: <InspectionSummary /> },
    { title: "#1. providing a non-complia...", component: <Overview /> },
    { title: "#2. hazardous materials and...", component: <Overview /> },
    { title: "#3. storage of suspect PAG...", component: <Overview /> },
    { title: "Actions Required by RP and...", component: <Overview /> },
    { title: "Enforcement Summary", component: <Overview /> },
    { title: "Regulatory Consideration", component: <Overview /> },
    { title: "Inspection Version Dates", component: <Overview /> },
    { title: "Appendices", component: <Overview /> },
  ];

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
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "row",
          width: "100%",
          gap: 2,
        }}
      >
        <Tabs
          orientation="vertical"
          variant="scrollable"
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
            "& .MuiTabs-flexContainer": {
              gap: 2,
            },
            "& .MuiTab-root": {
              alignItems: "flex-start",
              borderRadius: 1,
              border: `1px solid ${BCDesignTokens.surfaceColorBorderDefault}`,
              height: "40px",
              py: 0,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              minHeight: "unset",
            },
            "& .Mui-selected": {
              borderColor: BCDesignTokens.surfaceColorBorderActive,
              color: BCDesignTokens.themePrimaryBlue,
            },
          }}
        >
          {tabItems.map((item, index) => (
            <Tab key={index} label={item.title} {...a11yProps(index)} />
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
