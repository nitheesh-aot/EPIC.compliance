import { Grid } from "@mui/material";
import GridLabelValuePair from "@/components/Shared/GridLabelValuePair";
import IRBoxContainer from "./IRBoxContainer";
import { useReportStore } from "@/components/App/Inspections/Profile/Reports/reportStore";
import { useEffect, useState } from "react";
import dateUtils from "@/utils/dateUtils";
import { IR_STATUS } from "@/utils/constants";

const InspectionDates = () => {
  const { inspectionReportsData, irApprovalsData } = useReportStore();

  const [inspectionDateIssued, setInspectionDateIssued] = useState<
    string | undefined
  >("n/a");
  const [inspectionDatePreliminary, setInspectionDatePreliminary] = useState<
    string | undefined
  >("n/a");

  useEffect(() => {
    const dateIssued =
      inspectionReportsData?.date_issued ??
      inspectionReportsData?.intended_issuance_date ??
      "";
    setInspectionDateIssued(
      dateIssued ? dateUtils.formatDate(dateIssued) : "n/a"
    );

    const datePreliminaries =
      irApprovalsData
        ?.filter(
          (approval) =>
            approval.ir_status_id === IR_STATUS.PRELIMINARY &&
            approval.date_report_sent
        )
        ?.map((approval) => dateUtils.formatDate(approval.date_report_sent)) ??
      [];
    setInspectionDatePreliminary(
      datePreliminaries?.length > 0 ? datePreliminaries.join(", ") : "n/a"
    );
  }, [inspectionReportsData, irApprovalsData]);

  return (
    <IRBoxContainer title="Inspection Version Dates">
      <Grid container spacing={1}>
        <GridLabelValuePair
          label="Date Preliminary"
          value={inspectionDatePreliminary}
        />
        <GridLabelValuePair label="Date Issued" value={inspectionDateIssued} />
      </Grid>
    </IRBoxContainer>
  );
};

export default InspectionDates;
