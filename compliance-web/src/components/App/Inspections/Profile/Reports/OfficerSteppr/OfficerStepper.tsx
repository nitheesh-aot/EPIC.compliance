import { Box, Step, StepLabel, Stepper } from "@mui/material";
import { BCDesignTokens } from "epic.theme";
import { useState } from "react";
import PreliminaryReview from "./PreliminaryReview";
import RegPartyResponse from "./RegPartyResponse";
import IRVersionSelect from "./IRVersionSelect";
import {
  useUpdateInspectionRecord,
  useUpdateIRApproval,
  useUpdateIRReportToFinal,
} from "@/hooks/useInspectionReports";
import { useReportStore } from "../reportStore";
import {
  InspectionRecordApprovalPayload,
  IRApproval,
} from "@/models/IRApproval";
import { notify } from "@/store/snackbarStore";
import { InspectionRecord } from "@/models/InspectionRecord";
import { IRProgressEnum } from "@/utils/constants";

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
    setInspectionReportsData,
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

  const onSuccessApproval = (data: IRApproval) => {
    setIRApprovalsData([data]);
    notify.success("Inspection record approval updated");
  };

  const onSuccessIRReport = (data: InspectionRecord) => {
    setInspectionReportsData(data);
    notify.success("Inspection record updated");
    handleNext();
  };

  const { mutateAsync: updateIRApprovalStatusAsync } =
    useUpdateIRApproval(onSuccessApproval);

  const { mutate: updateIRReportToFinal } =
    useUpdateIRReportToFinal(onSuccessIRReport);

  const { mutate: updateInspectionRecord } =
    useUpdateInspectionRecord(onSuccessIRReport);

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
    // doing this to avoid going to the next step before all the updates are done
    handleNext();
  };

  const onUpdateIRReport = (type: "final" | "preliminary") => {
    if (type === "final") {
      updateIRReportToFinal({
        inspectionId: inspectionData?.id ?? 0,
        inspectionRecordId: inspectionReportsData?.id ?? 0,
      });
    } else {
      updateInspectionRecord({
        inspectionId: inspectionData?.id ?? 0,
        inspectionRecordId: inspectionReportsData?.id ?? 0,
        updateRecord: {
          field_name: "ir_progress",
          value: IRProgressEnum.PRELIMINARY_DRAFTING,
        },
      });
    }
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
          <IRVersionSelect
            onBack={handleBack}
            onUpdateIRReportToFinal={() => onUpdateIRReport("final")}
            onUpdateIRReportToPreliminary={() =>
              onUpdateIRReport("preliminary")
            }
          />
        )}
      </Box>
    </Box>
  );
}
