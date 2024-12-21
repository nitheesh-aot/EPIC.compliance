import { Box, Typography, Chip, Tabs, Tab } from "@mui/material";
import { BCDesignTokens } from "epic.theme";
import BreadcrumbsNav, {
  BreadcrumbItem,
} from "@/components/Shared/BreadcrumbsNav";
import CaseFileCreateInspection from "@/components/App/CaseFiles/Profile/CaseFileCreateInspection";
import CaseFileCreateComplaint from "@/components/App/CaseFiles/Profile/CaseFileCreateComplaint";
import React from "react";
import { FILE_PROFILE_CONTEXT } from "@/utils/constants";
import CaseFileActions from "@/components/App/CaseFiles/Profile/CaseFileActions";
import InspectionFileActions from "@/components/App/Inspections/Profile/InspectionFileActions";
import ComplaintFileActions from "@/components/App/Complaints/Profile/ComplaintFileActions";
import { useTab } from "@/store/tabStore";

interface FileProfileHeaderProps {
  fileNumber: string;
  status: string;
  breadcrumbs: BreadcrumbItem[];
  profileContext: string;
}

const FileProfileHeader: React.FC<FileProfileHeaderProps> = ({
  fileNumber,
  status,
  breadcrumbs,
  profileContext,
}) => {
  const { currentTab, setCurrentTab } = useTab();

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const tabStyle = {
    minWidth: "auto",
    minHeight: "36px",
    padding: "0.5rem 0",
    fontSize: BCDesignTokens.typographyFontSizeSmallBody,
  };

  return (
    <Box
      id="file-profile-header"
      display={"flex"}
      flexDirection={"column"}
      bgcolor={BCDesignTokens.surfaceColorBackgroundLightGray}
    >
      <Box
        display={"flex"}
        justifyContent={"space-between"}
        padding={"1.5rem 2.5rem 1.5rem 3.75rem"}
      >
        <Box display={"flex"} flexDirection={"column"} gap={1}>
          <BreadcrumbsNav items={breadcrumbs} />
          <Box display={"flex"} gap={1} alignItems={"center"}>
            <Typography variant="h3">{fileNumber}</Typography>
            <Chip
              label={status}
              color={status?.toLowerCase() === "open" ? "success" : "error"}
              variant="outlined"
              size="small"
            />
          </Box>
        </Box>
        <Box display={"flex"} gap={1}>
          {profileContext === FILE_PROFILE_CONTEXT.CASEFILE && (
            <>
              <CaseFileCreateInspection
                fileNumber={fileNumber}
                disabled={status.toLowerCase() === "closed"}
              />
              <CaseFileCreateComplaint
                fileNumber={fileNumber}
                disabled={status.toLowerCase() === "closed"}
              />
              <CaseFileActions status={status} fileNumber={fileNumber} />
            </>
          )}
          {profileContext === FILE_PROFILE_CONTEXT.COMPLAINT && (
            <ComplaintFileActions status={status} fileNumber={fileNumber} />
          )}
          {profileContext === FILE_PROFILE_CONTEXT.INSPECTION && (
            <InspectionFileActions status={status} fileNumber={fileNumber} />
          )}
        </Box>
      </Box>
      <Tabs
        value={currentTab}
        onChange={handleChange}
        sx={{
          minHeight: "36px",
          marginTop: "-0.5rem",
          paddingLeft: "3.75rem",
          "& .MuiTabs-flexContainer": {
            gap: "1rem",
          },
        }}
      >
        <Tab label="Item One" sx={tabStyle} />
        <Tab label="Item" sx={tabStyle} />
        <Tab label="Item Three" sx={tabStyle} />
      </Tabs>
    </Box>
  );
};

export default FileProfileHeader;
