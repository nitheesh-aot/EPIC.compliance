import { Typography } from "@mui/material";
import IRBoxContainer from "./IRBoxContainer";
import { useReportStore } from "@/components/App/Inspections/Profile/Reports/reportStore";
import { useEffect } from "react";
import { notify } from "@/store/snackbarStore";
import { useResetInspectionRecord, useUpdateInspectionRecord } from "@/hooks/useInspectionReports";
import { InspectionRecord } from "@/models/InspectionRecord";
import { DEFAULT_REPORT_TAB_CONTENT } from "@/utils/constants";

const IREnforcementSummary = () => {
  const {
    inspectionData,
    inspectionReportsData,
    enforcementSummary,
    isReportsReadOnly,
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

  const { mutate: resetInspectionRecord } =
    useResetInspectionRecord(handleOnSuccess);

  const handleResetEnforcementSummary = () => {
    resetInspectionRecord({
      inspectionId: inspectionData?.id ?? 0,
      inspectionRecordId: inspectionReportsData?.id ?? 0,
      resetPayload: {
        field_name: "enforcement_summary",
      },
    });
  };

  return (
    <IRBoxContainer
      title="Enforcement Summary"
      defaultValue={enforcementSummary}
      onEditSubmit={!isReportsReadOnly ? handleSaveEnforcementSummary : undefined}
      onReset={!isReportsReadOnly ? handleResetEnforcementSummary : undefined}
    >
      <Typography
        variant="body1"
        component={"div"}
        className="editor-content"
        dangerouslySetInnerHTML={{ __html: enforcementSummary || DEFAULT_REPORT_TAB_CONTENT }}
      />
    </IRBoxContainer>
  );
};

export default IREnforcementSummary;
