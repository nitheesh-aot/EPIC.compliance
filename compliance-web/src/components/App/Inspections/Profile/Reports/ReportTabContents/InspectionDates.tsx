import { Grid } from "@mui/material";
import GridLabelValuePair from "@/components/Shared/GridLabelValuePair";
import IRBoxContainer from "./IRBoxContainer";
import { useReportStore } from "@/components/App/Inspections/Profile/Reports/reportStore";

const InspectionDates = () => {
  const { inspectionVersionDatePreliminary, inspectionVersionDateIssued } = useReportStore();
  return (
    <IRBoxContainer title="Inspection Version Dates">
      <Grid container spacing={1}>
        <GridLabelValuePair
          label="Date Preliminary"
          value={inspectionVersionDatePreliminary ?? "n/a"}
        />
        <GridLabelValuePair
          label="Date Issued"
          value={inspectionVersionDateIssued ?? "n/a"}
        />
      </Grid>
    </IRBoxContainer>
  );
};

export default InspectionDates;
