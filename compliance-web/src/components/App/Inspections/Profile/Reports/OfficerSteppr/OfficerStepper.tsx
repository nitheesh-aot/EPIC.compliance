import { Box, Button, Step, StepLabel, Stepper } from "@mui/material";
import { BCDesignTokens } from "epic.theme";
import { useState } from "react";
import PreliminaryReview from "./PreliminaryReview";
import RegPartyResponse from "./RegPartyResponse";
import IRVersionSelect from "./IRVersionSelect";

const steps = [
  "Preliminary Review",
  "Response from Regulated Party",
  "Select IR version",
];

export default function OfficerStepper() {
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  return (
    <Box
      sx={{
        mt: 1,
        mb: 2,
        border: `1px solid ${BCDesignTokens.surfaceColorBorderDefault}`,
        borderRadius: 1,
      }}
    >
      <Stepper
        activeStep={activeStep}
        sx={{
          backgroundColor: BCDesignTokens.surfaceColorBackgroundLightGray,
          p: 2,
          borderBottom: `1px solid ${BCDesignTokens.surfaceColorBorderDefault}`,
          fontWeight: 600,
        }}
      >
        {steps.map((label) => {
          return (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>
      <Box sx={{ p: 2 }}>
        {activeStep === 0 && <PreliminaryReview onNext={handleNext} />}
        {activeStep === 1 && <RegPartyResponse />}
        {activeStep === 2 && <IRVersionSelect />}
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-end",
            gap: 1,
          }}
        >
          {activeStep > 0 && (
            <Button variant="text" size="small" onClick={handleBack}>
              Previous
            </Button>
          )}
          <Button variant="outlined" size="small" onClick={handleNext}>
            {activeStep === steps.length - 1 ? "Finish" : "Next"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
