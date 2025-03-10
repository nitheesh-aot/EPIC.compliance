import React, { useState } from "react";
import { Inspection } from "@/models/Inspection";
import { Box, Button, FormControlLabel, Radio, RadioGroup, Typography } from "@mui/material";

interface InspectionReportsProps {
  inspectionData: Inspection;
}

/**
 * Component for selecting the inspection report version (Preliminary or Final)
 */
const InspectionReports: React.FC<InspectionReportsProps> = () => {
  // Use empty string as initial value to keep it controlled but without selection
  const [reportVersion, setReportVersion] = useState<string>("");

  const handleReportVersionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setReportVersion(event.target.value);
  };

  const handleProceedToReport = () => {
    // Handle proceeding to the selected report version
    // Additional logic to navigate or load the selected report version
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        py: 3,
        maxWidth: "600px",
      }}
    >
      <Typography variant="h6" mb={2}>
        Select Report Version
      </Typography>
      
      <Typography variant="body2" mb={2}>
        Choose the IR report version you want to work on.
      </Typography>
      
      <RadioGroup
        value={reportVersion}
        onChange={handleReportVersionChange}
        sx={{ mb: 3 }}
      >
        <FormControlLabel 
          value="preliminary" 
          control={<Radio />} 
          label="Preliminary Inspection Record" 
          sx={{ mb: 0.5 }}
        />
        <FormControlLabel 
          value="final" 
          control={<Radio />} 
          label="Final Inspection Record" 
        />
      </RadioGroup>
      
      <Button
        onClick={handleProceedToReport}
        disabled={!reportVersion}
        sx={{ 
          width: "fit-content"
        }}
      >
        Proceed to Report
      </Button>
    </Box>
  );
};

export default InspectionReports;
