import { Typography } from "@mui/material";
import IRBoxContainer from "./IRBoxContainer";
import { useReportStore } from "@/components/App/Inspections/Profile/Reports/reportStore";
import { useEffect, useState } from "react";
import {
  useResetInspectionRecord,
  useUpdateInspectionRecord,
} from "@/hooks/useInspectionReports";
import { InspectionRecord } from "@/models/InspectionRecord";
import { notify } from "@/store/snackbarStore";
import { IR_STATUS } from "@/utils/constants";

const InspectionSummary = () => {
  const {
    inspectionData,
    inspectionScope,
    preliminaryReviewDetails,
    findingsStatement,
    inspectionReportsData,
    setInspectionScope,
    setPreliminaryReviewDetails,
    setFindingsStatement,
    setInspectionReportsData,
  } = useReportStore();
  const [isFindingsStatementChanged, setIsFindingsStatementChanged] =
    useState(false);
  const [
    isPreliminaryReviewDetailsChanged,
    setIsPreliminaryReviewDetailsChanged,
  ] = useState(false);
  const [isFinalReport, setIsFinalReport] = useState(false);

  useEffect(() => {
    setInspectionScope(inspectionReportsData?.inspection_scope ?? "");
    setPreliminaryReviewDetails(
      inspectionReportsData?.preliminary_review_details ?? ""
    );
    setFindingsStatement(inspectionReportsData?.finding_statement ?? "");
    setIsFindingsStatementChanged(
      inspectionReportsData?.field_change_info?.finding_statement_changed ??
        false
    );
    setIsPreliminaryReviewDetailsChanged(
      inspectionReportsData?.field_change_info
        ?.preliminary_review_details_changed ?? false
    );
    setIsFinalReport(inspectionReportsData?.ir_status_id === IR_STATUS.FINAL);
  }, [
    inspectionReportsData,
    setFindingsStatement,
    setInspectionScope,
    setPreliminaryReviewDetails,
  ]);

  const handleOnSuccess = (data: InspectionRecord) => {
    setInspectionReportsData(data);
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
      {isFinalReport && (
        <IRBoxContainer
          title="Preliminary Review Details"
          sx={{ mb: 1 }}
          defaultValue={preliminaryReviewDetails}
          onEditSubmit={(editorValue) =>
            handleSaveInspectionSummary(
              editorValue,
              "preliminary_review_details"
            )
          }
          onReset={
            isPreliminaryReviewDetailsChanged
              ? () => handleResetInspectionSummary("preliminary_review_details")
              : undefined
          }
        >
          <Typography
            variant="body1"
            component={"div"}
            className="editor-content"
            dangerouslySetInnerHTML={{ __html: preliminaryReviewDetails || "" }}
          />
        </IRBoxContainer>
      )}
      <IRBoxContainer
        title="Findings Statement"
        defaultValue={findingsStatement}
        onEditSubmit={(editorValue) =>
          handleSaveInspectionSummary(editorValue, "finding_statement")
        }
        onReset={
          isFindingsStatementChanged
            ? () => handleResetInspectionSummary("finding_statement")
            : undefined
        }
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
