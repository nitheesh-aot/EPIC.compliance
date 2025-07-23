import { Box, Typography, Chip, Alert } from "@mui/material";
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
import InspectionFileTabs from "@/components/App/Inspections/Profile/InspectionFileTabs";

interface FileProfileHeaderProps {
  fileNumber: string;
  status: string;
  breadcrumbs: BreadcrumbItem[];
  profileContext: string;
  caseFileNumber?: string;
  isInititationOther?: boolean;
  isHistorical?: boolean;
}

const FileProfileHeader: React.FC<FileProfileHeaderProps> = ({
  fileNumber,
  status,
  breadcrumbs,
  profileContext,
  caseFileNumber,
  isInititationOther = false,
  isHistorical = false,
}) => {
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
          <BreadcrumbsNav items={breadcrumbs} caseFileNumber={caseFileNumber} />
          <Box display={"flex"} gap={1} alignItems={"center"}>
            <Typography variant="h3">{fileNumber}</Typography>
            <Chip
              label={status}
              color={status?.toLowerCase() === "open" ? "success" : "error"}
              variant="outlined"
              size="small"
            />
          </Box>
          {isHistorical && (
            <Alert
              variant="outlined"
              severity="warning"
              sx={{
                py: "2px",
                backgroundColor: BCDesignTokens.supportSurfaceColorWarning,
              }}
            >
              You are in Historical Mode. Records created here will bypass
              Deputy Review and include additional options for Enforcement.
            </Alert>
          )}
        </Box>
        <Box display={"flex"} gap={1}>
          {profileContext === FILE_PROFILE_CONTEXT.CASEFILE && (
            <>
              <CaseFileCreateInspection
                fileNumber={fileNumber}
                hidden={status.toLowerCase() === "closed" || isInititationOther}
              />
              <CaseFileCreateComplaint
                fileNumber={fileNumber}
                hidden={status.toLowerCase() === "closed" || isInititationOther}
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
      {profileContext === FILE_PROFILE_CONTEXT.INSPECTION && (
        <InspectionFileTabs />
      )}
    </Box>
  );
};

export default FileProfileHeader;
