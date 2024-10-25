import React from "react";
import { EditRounded } from "@mui/icons-material";
import { Box, Button, Typography } from "@mui/material";
import FileProfileProperty from "@/components/App/FileProfileProperty";
import dateUtils from "@/utils/dateUtils";
import { formatAuthorization } from "@/utils/appUtils";
import { Complaint } from "@/models/Complaint";
import { useMenuStore } from "@/store/menuStore";

interface ComplaintGeneralInformationProps {
  complaintData: Complaint;
  onEdit: () => void;
}

const ComplaintGeneralInformation: React.FC<
  ComplaintGeneralInformationProps
> = ({ complaintData, onEdit }) => {
  const { appHeaderHeight } = useMenuStore();

  const generalProperties = [
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
      name: "Concern Description",
      value: complaintData.concern_description,
    },
    {
      name: "Location Description",
      value: complaintData.location_description,
    },
    { name: "Primary", value: complaintData.primary_officer?.full_name },
    {
      name: "Date Received",
      value: dateUtils.formatDate(complaintData.date_received),
    },
    {
      name: "Requirement Source",
      value: complaintData.requirement_source?.name,
    },
    {
      name: "Condition #",
      // value: complaintData.condition_number,
    },
    {
      name: "Topic",
      value: complaintData.requirement_detail?.topic?.name,
    },
  ];

  const complaintProperties = [
    { name: "Complaint Source", value: complaintData.source_type?.name },
    { name: "Full Name", value: complaintData.source_contact?.full_name },
    { name: "Email", value: complaintData.source_contact?.email },
    { name: "Phone Number", value: complaintData.source_contact?.phone },
    { name: "Comments", value: complaintData.source_contact?.comment },
  ];

  return (
    <Box
      display={"flex"}
      flexGrow={1}
      flexDirection={"column"}
      width={"75%"}
      height={`calc(100vh - ${appHeaderHeight + 158}px)`} // 158px is the height of the FileProfileHeader and the padding
      overflow={"auto"}
    >
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
        {generalProperties.map((property) => (
          <FileProfileProperty
            key={property.name}
            propertyName={property.name}
            propertyValue={property.value}
          />
        ))}
      </Box>
      <Box mb={"1rem"} mt={"1.5rem"}>
        <Typography variant="h6">Complainant Information</Typography>
      </Box>
      <Box display={"flex"} flexDirection={"column"}>
        {complaintProperties.map((property) => (
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
