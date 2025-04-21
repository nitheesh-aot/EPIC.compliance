import { Box, Step, StepLabel, Stepper } from "@mui/material";
import { BCDesignTokens } from "epic.theme";
import { useState } from "react";
import PreliminaryReview from "./PreliminaryReview";
import RegPartyResponse from "./RegPartyResponse";
import IRVersionSelect from "./IRVersionSelect";
import { useUpdateIRApproval } from "@/hooks/useInspectionReports";
import { useReportStore } from "../reportStore";
import {
  InspectionRecordApprovalPayload,
  IRApproval,
} from "@/models/IRApproval";
import { notify } from "@/store/snackbarStore";

const steps = [
  "Preliminary Review",
  "Response from Regulated Party",
  "Select IR version",
];

export default function OfficerStepper() {
  const {
    inspectionData,
    inspectionReportsData,
    irApprovalsData,
    setIRApprovalsData,
  } = useReportStore();
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      // TODO: Submit form and remove the stepper
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const onSuccess = (data: IRApproval) => {
    setIRApprovalsData([data]);
    notify.success("Inspection record approval updated");
  };

  const { mutateAsync: updateIRApprovalStatusAsync } =
    useUpdateIRApproval(onSuccess);

  const onUpdateIRApprovalStep = async (
    approvalPayloads: InspectionRecordApprovalPayload[]
  ) => {
    for (const approvalPayload of approvalPayloads) {
      await updateIRApprovalStatusAsync({
        inspectionId: inspectionData?.id ?? 0,
        inspectionRecordId: inspectionReportsData?.id ?? 0,
        approvalId: irApprovalsData?.[0]?.id ?? 0,
        approvalPayload,
      });
    }
    handleNext();
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
        {activeStep === 0 && (
          <PreliminaryReview
            onUpdateIRApprovalStep={onUpdateIRApprovalStep}
            nextStep={handleNext}
          />
        )}
        {activeStep === 1 && (
          <RegPartyResponse
            onUpdateIRApprovalStep={onUpdateIRApprovalStep}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}
        {activeStep === 2 && (
          <IRVersionSelect onNext={handleNext} onBack={handleBack} />
        )}
      </Box>
    </Box>
  );
}
