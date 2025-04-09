import { Typography } from "@mui/material";
import IRBoxContainer from "./IRBoxContainer";
import { useReportStore } from "@/components/App/Inspections/Profile/Reports/reportStore";
import { useEffect } from "react";
import { notify } from "@/store/snackbarStore";
import { useUpdateInspectionRecord } from "@/hooks/useInspectionReports";
import { InspectionRecord } from "@/models/InspectionRecord";

const IREnforcementSummary = () => {
  const {
    inspectionData,
    inspectionReportsData,
    enforcementSummary,
    setEnforcementSummary,
    setInspectionReportsData,
  } = useReportStore();

  useEffect(() => {
    setEnforcementSummary(inspectionReportsData?.enforcement_summary ?? "");
  }, [inspectionReportsData, setEnforcementSummary]);

  const handleOnSuccess = (data: InspectionRecord) => {
    setInspectionReportsData(data);
    notify.success("Enforcement summary updated");
  };

  const { mutate: updateInspectionRecord } =
    useUpdateInspectionRecord(handleOnSuccess);

  const handleSaveEnforcementSummary = (editorValue: string) => {
    updateInspectionRecord({
      inspectionId: inspectionData?.id ?? 0,
      inspectionRecordId: inspectionReportsData?.id ?? 0,
      updateRecord: {
        field_name: "enforcement_summary",
        value: editorValue,
      },
    });
  };

  return (
    <IRBoxContainer
      title="Enforcement Summary"
      defaultValue={enforcementSummary}
      onEditSubmit={handleSaveEnforcementSummary}
    >
      <Typography
        variant="body1"
        component={"div"}
        className="editor-content"
        dangerouslySetInnerHTML={{ __html: enforcementSummary || "" }}
      />
    </IRBoxContainer>
  );
};

export default IREnforcementSummary;
