import { Typography } from "@mui/material";
import IRBoxContainer from "./IRBoxContainer";
import { useReportStore } from "@/components/App/Inspections/Profile/Reports/reportStore";

const InspectionSummary = () => {
  const { inspectionSummary, findingsStatement, setInspectionSummary, setFindingsStatement } = useReportStore();

  const handleSaveInspectionSummary = (editorValue: string) => {
    setInspectionSummary(editorValue);
  };

  const handleSaveFindingsStatement = (editorValue: string) => {
    setFindingsStatement(editorValue);
  };

  return (
    <>
      <IRBoxContainer
        title="Inspection Scope"
        sx={{ mb: 1 }}
        defaultValue={inspectionSummary}
        onEditSubmit={handleSaveInspectionSummary}
      >
        <Typography
          variant="body1"
          component={"div"}
          className="editor-content"
          dangerouslySetInnerHTML={{ __html: inspectionSummary || "" }}
        />
      </IRBoxContainer>
      <IRBoxContainer
        title="Findings Statement"
        defaultValue={findingsStatement}
        onEditSubmit={handleSaveFindingsStatement}
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
