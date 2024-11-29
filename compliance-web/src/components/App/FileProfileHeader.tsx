import { Box, Typography, Chip } from "@mui/material";
import { BCDesignTokens } from "epic.theme";
import BreadcrumbsNav, {
  BreadcrumbItem,
} from "@/components/Shared/BreadcrumbsNav";
import CaseFileCreateInspection from "@/components/App/CaseFiles/Profile/CaseFileCreateInspection";
import CaseFileCreateComplaint from "@/components/App/CaseFiles/Profile/CaseFileCreateComplaint";
import React from "react";
import { FILE_PROFILE_CONTEXT } from "@/utils/constants";
import CaseFileActions from "@/components/App/CaseFiles/Profile/CaseFileActions";
import MenuActionDropdown from "@/components/Shared/MenuActionDropdown";

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
  return (
    <Box
      display={"flex"}
      justifyContent={"space-between"}
      bgcolor={BCDesignTokens.surfaceColorBackgroundLightGray}
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
            <CaseFileCreateInspection fileNumber={fileNumber} />
            <CaseFileCreateComplaint fileNumber={fileNumber} />
            <CaseFileActions status={status} fileNumber={fileNumber} />
          </>
        )}
        {(profileContext === FILE_PROFILE_CONTEXT.INSPECTION ||
          profileContext === FILE_PROFILE_CONTEXT.COMPLAINT) && (
          <MenuActionDropdown actions={[]} />
        )}
      </Box>
    </Box>
  );
};

export default FileProfileHeader;
