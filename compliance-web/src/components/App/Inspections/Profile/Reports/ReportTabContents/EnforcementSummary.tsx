import { Typography } from "@mui/material";
import IRBoxContainer from "./IRBoxContainer";
import { useReportStore } from "../reportStore";

const EnforcementSummary = () => {
  const { enforcementSummary, setEnforcementSummary } = useReportStore();

  const handleSaveEnforcementSummary = (editorValue: string) => {
    setEnforcementSummary(editorValue);
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

export default EnforcementSummary;
