import React from "react";
import { EditRounded } from "@mui/icons-material";
import { Box, Button, Typography } from "@mui/material";
import FileProfileProperty from "@/components/App/FileProfileProperty";
import dateUtils from "@/utils/dateUtils";
import { formatAuthorization } from "@/utils/appUtils";
import { Complaint } from "@/models/Complaint";

interface ComplaintGeneralInformationProps {
  complaintData: Complaint;
  onEdit: () => void;
}

const ComplaintGeneralInformation: React.FC<
  ComplaintGeneralInformationProps
> = ({ complaintData, onEdit }) => {
  const properties = [
    { name: "Project Name", value: complaintData.project.name },
    {
      name: "Authorization",
      value: formatAuthorization(complaintData.authorization),
    },
    { name: "Regulated Party", value: complaintData.regulated_party },
    { name: "Project Description", value: complaintData.project_description },
    { name: "Type", value: complaintData.type },
    { name: "Subtype", value: complaintData.sub_type },
    {
      name: "Location Description",
      value: complaintData.location_description,
    },
    {
      name: "Concern Description",
      value: complaintData.concern_description,
    },
    { name: "Lead Officer", value: complaintData.lead_officer?.full_name },
    {
      name: "Date Received",
      value: dateUtils.formatDate(complaintData.date_received),
    },
    {
      name: "Requirement Source",
      // value: complaintData.requirement_source,
    },
    {
      name: "Condition #",
      // value: complaintData.condition_number,
    },
    {
      name: "Topic",
      // value: complaintData.topic?.name,
    },
  ];

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
        {properties.map((property) => (
          <FileProfileProperty
            key={property.name}
            propertyName={property.name}
            propertyValue={property.value}
          />
        ))}
      </Box>
    </Box>
  );
};

export default ComplaintGeneralInformation;
