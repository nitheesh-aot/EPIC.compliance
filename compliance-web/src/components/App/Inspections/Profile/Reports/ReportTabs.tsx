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
  const { setInspectionData } = useReportStore();

  const inspectionData = queryClient.getQueryData<Inspection>([
    "inspection",
    inspectionNumber,
  ]);

  useEffect(() => {
    if (inspectionData) {
      setInspectionData(inspectionData);
    }
  }, [inspectionData, setInspectionData]);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const tabItems = [
    { title: "IR Overview", component: <Overview /> },
    { title: "Inspection Summary", component: <Overview /> },
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
