import { Typography } from "@mui/material";
import IRBoxContainer from "./IRBoxContainer";

const InspectionSummary = () => {
  return (
    <>
      <IRBoxContainer title="Inspection Scope" onEdit={() => {}} sx={{ mb: 1 }}>
        <Typography variant="body1">
          The Officer inspected [BRIEF DESCRIPTION OF PROJECT COMPONENTS/AREAS
          INSPECTED] The inspection included a debrief of observations with
          Project staff on January 17, 2025. The following requirements were
          inspected against: 1. Condition 7 of Schedule B with respect to
          providing a non-compliance notification to the EAO. 2. Condition 14 of
          Schedule B with respect to hazardous materials and fuel storage. 3.
          Condition 5 of Schedule B with respect to storage of suspect PAG
          materials.
        </Typography>
      </IRBoxContainer>
      <IRBoxContainer title="Findings Statement" onEdit={() => {}}>
        <Typography variant="body1">
          Additional detail regarding these findings may be found in the
          sections below. The compliance findings in this report reflect the
          analysis based on the information obtained during the inspection
          commenced on the date noted above. These findings can change at any
          time upon information gathered through future inspections or if new
          information is obtained by the EAO Compliance and Enforcement Branch
          (CEB).
        </Typography>
      </IRBoxContainer>
    </>
  );
};

export default InspectionSummary;
