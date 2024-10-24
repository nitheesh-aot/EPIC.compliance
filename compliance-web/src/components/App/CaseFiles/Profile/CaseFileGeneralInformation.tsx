import dateUtils from "@/utils/dateUtils";
import { EditRounded } from "@mui/icons-material";
import { Box, Button, Typography } from "@mui/material";
import FileProfileProperty from "@/components/App/FileProfileProperty";
import { CaseFile } from "@/models/CaseFile";
import CaseFileInspectionsTable from "./CaseFileInspectionsTable";
import CaseFileComplaintsTable from "./CaseFileComplaintsTable";
import { INITIATION } from "@/utils/constants";

interface CaseFileGeneralInformationProps {
  caseFileData: CaseFile;
  onEdit: () => void;
}

const CaseFileGeneralInformation: React.FC<CaseFileGeneralInformationProps> = ({
  caseFileData,
  onEdit,
}) => {
  return (
    <Box display={"flex"} flexGrow={1} flexDirection={"column"} width={"60%"}>
      <Box display={"flex"} justifyContent={"space-between"} my={3}>
        <Typography variant="h6">General Information</Typography>
        <Button
          variant="text"
          color="primary"
          size="small"
          onClick={onEdit}
          startIcon={<EditRounded />}
        >
          Edit
        </Button>
      </Box>
      <Box display={"flex"} gap={8}>
        <Box>
          <FileProfileProperty
            propertyName="Project"
            propertyValue={caseFileData.project.name}
            size="small"
          />
          <FileProfileProperty
            propertyName="Date Created"
            propertyValue={dateUtils.formatDate(caseFileData.date_created)}
            size="small"
          />
          <FileProfileProperty
            propertyName="Initiation"
            propertyValue={caseFileData.initiation.name}
            size="small"
          />
        </Box>
        <Box>
          <FileProfileProperty
            propertyName="Primary"
            propertyValue={caseFileData.primary_officer?.full_name}
            size="small"
          />
          <FileProfileProperty
            propertyName="Other Assigned Officers"
            propertyValue={caseFileData.officers
              ?.map((officer) => officer.full_name)
              .join(", ")}
            size="small"
          />
        </Box>
      </Box>
      {caseFileData.initiation.id === INITIATION.INSPECTION_ID && (
        <CaseFileInspectionsTable caseFileId={caseFileData.id} />
      )}
      {caseFileData.initiation.id === INITIATION.COMPLAINTS_ID && (
        <CaseFileComplaintsTable caseFileId={caseFileData.id} />
      )}
    </Box>
  );
};

export default CaseFileGeneralInformation;
