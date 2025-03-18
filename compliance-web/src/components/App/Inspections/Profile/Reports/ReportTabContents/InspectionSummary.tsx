import { Typography } from "@mui/material";
import IRBoxContainer from "./IRBoxContainer";
import { useReportStore } from "@/components/App/Inspections/Profile/Reports/reportStore";
import { useEffect } from "react";
import {
  useResetInspectionRecord,
  useUpdateInspectionRecord,
} from "@/hooks/useInspectionReports";
import { InspectionRecord } from "@/models/InspectionRecord";
import { notify } from "@/store/snackbarStore";

const InspectionSummary = () => {
  const {
    inspectionData,
    inspectionScope,
    findingsStatement,
    inspectionReportsData,
    setInspectionScope,
    setFindingsStatement,
  } = useReportStore();

  useEffect(() => {
    setInspectionScope(inspectionReportsData?.inspection_scope ?? "");
    setFindingsStatement(inspectionReportsData?.finding_statement ?? "");
  }, [inspectionReportsData, setFindingsStatement, setInspectionScope]);

  const handleOnSuccess = (data: InspectionRecord) => {
    setInspectionScope(data.inspection_scope ?? "");
    setFindingsStatement(data.finding_statement ?? "");
    notify.success("Inspection summary updated");
  };

  const { mutate: updateInspectionRecord } =
    useUpdateInspectionRecord(handleOnSuccess);

  const { mutate: resetInspectionRecord } =
    useResetInspectionRecord(handleOnSuccess);

  const handleSaveInspectionSummary = (editorValue: string, field: string) => {
    updateInspectionRecord({
      inspectionId: inspectionData?.id ?? 0,
      inspectionRecordId: inspectionReportsData?.id ?? 0,
      updateRecord: {
        field_name: field,
        value: editorValue,
      },
    });
  };

  const handleResetInspectionSummary = (fieldName: string) => {
    resetInspectionRecord({
      inspectionId: inspectionData?.id ?? 0,
      inspectionRecordId: inspectionReportsData?.id ?? 0,
      resetPayload: {
        field_name: fieldName,
      },
    });
  };

  return (
    <>
      <IRBoxContainer
        title="Inspection Scope"
        sx={{ mb: 1 }}
        defaultValue={inspectionScope}
        onEditSubmit={(editorValue) =>
          handleSaveInspectionSummary(editorValue, "inspection_scope")
        }
        onReset={() => handleResetInspectionSummary("inspection_scope")}
      >
        <Typography
          variant="body1"
          component={"div"}
          className="editor-content"
          dangerouslySetInnerHTML={{ __html: inspectionScope || "" }}
        />
      </IRBoxContainer>
      <IRBoxContainer
        title="Findings Statement"
        defaultValue={findingsStatement}
        onEditSubmit={(editorValue) =>
          handleSaveInspectionSummary(editorValue, "finding_statement")
        }
        onReset={() => handleResetInspectionSummary("finding_statement")}
      >
        <Typography
          variant="body1"
          component={"div"}
          className="editor-content"
          dangerouslySetInnerHTML={{ __html: findingsStatement || "" }}
        />
      </IRBoxContainer>
    </>
  );
};

export default InspectionSummary;
