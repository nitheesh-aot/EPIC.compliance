import React from "react";
import { AddRounded } from "@mui/icons-material";
import { Box, Button, Typography } from "@mui/material";

interface InspectionRequirementsProps {}

const InspectionRequirements: React.FC<InspectionRequirementsProps> = () => {
  return (
    <Box
      display={"flex"}
      flexGrow={1}
      flexDirection={"column"}
      overflow={"auto"}
    >
      <Box display={"flex"} justifyContent={"space-between"} my={3}>
        <Typography variant="h6">Requirements</Typography>
        <Button
          variant="text"
          color="primary"
          size="small"
          onClick={() => {}}
          startIcon={<AddRounded />}
        >
          New Requirement
        </Button>
      </Box>
    </Box>
  );
};

export default InspectionRequirements;
