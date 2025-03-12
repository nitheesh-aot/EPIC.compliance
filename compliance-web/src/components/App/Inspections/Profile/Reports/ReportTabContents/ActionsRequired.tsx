import { Typography } from "@mui/material";
import IRBoxContainer from "./IRBoxContainer";
import { useReportStore } from "../reportStore";

const ActionsRequired = () => {
  const { actionsRequired, setActionsRequired } = useReportStore();

  const handleSaveActionsRequired = (editorValue: string) => {
    setActionsRequired(editorValue);
  };

  return (
    <IRBoxContainer
      title="Actions Required by Certificate Holder and Comments"
      defaultValue={actionsRequired}
      onEditSubmit={handleSaveActionsRequired}
    >
      <Typography
        variant="body1"
        component={"div"}
        className="editor-content"
        dangerouslySetInnerHTML={{ __html: actionsRequired || "" }}
      />
    </IRBoxContainer>
  );
};

export default ActionsRequired;
