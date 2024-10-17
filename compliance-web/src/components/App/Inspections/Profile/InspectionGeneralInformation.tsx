import { EditRounded } from "@mui/icons-material";
import { Box, Button, Typography } from "@mui/material";
import FileProfileProperty from "@/components/App/FileProfileProperty";
import { Inspection } from "@/models/Inspection";

interface InspectionGeneralInformationProps {
  inspectionData: Inspection;
  onEdit: () => void;
}

const InspectionGeneralInformation: React.FC<
  InspectionGeneralInformationProps
> = ({ inspectionData, onEdit }) => {
  return (
    <Box display={"flex"} flexGrow={1} flexDirection={"column"}>
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
      <Box display={"flex"} flexDirection={"column"}>
        <FileProfileProperty
          propertyName="Project"
          propertyValue={inspectionData.project.name}
        />
        <FileProfileProperty
          propertyName="Authorization"
          // propertyValue={inspectionData.}
        />
        <FileProfileProperty
          propertyName="Regulated Party"
          // propertyValue={inspectionData.}
        />
        <FileProfileProperty
          propertyName="Project Description"
          // propertyValue={inspectionData.}
        />
        <FileProfileProperty
          propertyName="Project Type"
          // propertyValue={inspectionData.}
        />
        <FileProfileProperty
          propertyName="Project Subtype"
          // propertyValue={inspectionData.}
        />
        <FileProfileProperty
          propertyName="Location Description"
          propertyValue={inspectionData.location_description}
        />
        <FileProfileProperty
          propertyName="Initiation"
          propertyValue={inspectionData.initiation.name}
        />
        <FileProfileProperty
          propertyName="Lead Officer"
          propertyValue={inspectionData.lead_officer?.full_name}
        />
        <FileProfileProperty
          propertyName="Other Officers"
          propertyValue={inspectionData.officers
            ?.map((officer) => officer.full_name)
            .join(", ")}
        />
      </Box>
    </Box>
  );
};

export default InspectionGeneralInformation;
