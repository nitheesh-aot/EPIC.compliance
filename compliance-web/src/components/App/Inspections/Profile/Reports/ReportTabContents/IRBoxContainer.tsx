import LexicalEditor from "@/components/Shared/LexicalEditor/LexicalEditor";
import { EditOutlined } from "@mui/icons-material";
import { Box, Typography, IconButton, SxProps, Button } from "@mui/material";
import { BCDesignTokens } from "epic.theme";
import { useState } from "react";
import { $generateHtmlFromNodes } from "@lexical/html";

type IRBoxContainerProps = {
  title: string;
  children?: React.ReactNode;
  sx?: SxProps;
  onEdit?: () => void;
  defaultValue?: string;
  onEditSubmit?: (editorValue: string) => void;
};

const IRBoxContainer = ({
  title,
  children,
  sx,
  onEdit,
  defaultValue,
  onEditSubmit,
}: IRBoxContainerProps) => {
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [editorValue, setEditorValue] = useState<string>(defaultValue || "");


  const handleEdit = () => {
    setIsEdit(true);
    setEditorValue(defaultValue || "");
  };

  const handleSave = () => {
    setIsEdit(false);
    onEditSubmit?.(editorValue);
  };

  const handleCancel = () => {
    setIsEdit(false);
    setEditorValue("");
  };

  return (
    <Box
      aria-label={title}
      sx={{
        border: `1px solid ${BCDesignTokens.surfaceColorBorderDefault}`,
        borderRadius: 1,
        ...sx,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 3,
          height: 40,
          borderBottom: `1px solid ${BCDesignTokens.surfaceColorBorderDefault}`,
        }}
      >
        <Typography variant="body1">{title}</Typography>
        <IconButton
          size="small"
          color="secondary"
          onClick={onEdit || handleEdit}
          data-testid={`irbox-container-edit`}
        >
          <EditOutlined />
        </IconButton>
      </Box>
      <Box px={3} py={2}>
        {isEdit ? (
          <>
            <LexicalEditor
              name={"inspection-scope"}
              label={"Text"}
              errorMsg={""}
              placeholder={"Enter text..."}
              defaultHtml={editorValue}
              height={"400px"}
              onChange={(editorState, editor) => {
                editorState.read(() => {
                  const editorStateHtmlString = $generateHtmlFromNodes(editor);
                  setEditorValue(editorStateHtmlString);
                });
              }}
            />
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 1,
                mt: 1.5,
              }}
            >
              <Button
                variant="contained"
                color="secondary"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button variant="contained" color="primary" onClick={handleSave}>
                Save
              </Button>
            </Box>
          </>
        ) : (
          children
        )}
      </Box>
    </Box>
  );
};

export default IRBoxContainer;
