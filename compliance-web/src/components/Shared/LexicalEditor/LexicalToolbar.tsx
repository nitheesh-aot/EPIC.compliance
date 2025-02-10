import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
  FormatBoldRounded,
  FormatItalicRounded,
  FormatStrikethroughRounded,
  FormatUnderlinedRounded,
  RedoRounded,
  UndoRounded,
  FormatIndentDecreaseRounded,
  FormatIndentIncreaseRounded,
  FormatListBulletedRounded,
  FormatListNumberedRounded,
} from "@mui/icons-material";
import {
  $getSelection,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
  INDENT_CONTENT_COMMAND,
  OUTDENT_CONTENT_COMMAND,
  ElementFormatType,
} from "lexical";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";
import { useCallback, useEffect, useRef, useState } from "react";
import { Box, IconButton } from "@mui/material";
import LexicalToolbarAlign from "./LexicalToolbarAlign";

const LowPriority = 1;

function Divider() {
  return <div className="divider" />;
}

export default function ToolbarPlugin({ isAdvanced }: { isAdvanced: boolean }) {
  const [editor] = useLexicalComposerContext();
  const toolbarRef = useRef(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      // Update text format
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));
    }
  }, []);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          $updateToolbar();
          return false;
        },
        LowPriority
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        LowPriority
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        LowPriority
      )
    );
  }, [editor, $updateToolbar]);

  const handleAlignmentChange = (newAlignment: ElementFormatType) => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, newAlignment);
  };

  return (
    <Box className="toolbar" ref={toolbarRef}>
      <IconButton
        disabled={!canUndo}
        onClick={() => {
          editor.dispatchCommand(UNDO_COMMAND, undefined);
        }}
        className="toolbar-item"
        aria-label="Undo"
      >
        <UndoRounded fontSize="inherit" />
      </IconButton>
      <IconButton
        disabled={!canRedo}
        onClick={() => {
          editor.dispatchCommand(REDO_COMMAND, undefined);
        }}
        className="toolbar-item"
        aria-label="Redo"
      >
        <RedoRounded fontSize="inherit" />
      </IconButton>
      <Divider />
      <IconButton
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
        }}
        className={"toolbar-item " + (isBold ? "active" : "")}
        aria-label="Format Bold"
      >
        <FormatBoldRounded fontSize="inherit" />
      </IconButton>
      <IconButton
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
        }}
        className={"toolbar-item " + (isItalic ? "active" : "")}
        aria-label="Format Italics"
      >
        <FormatItalicRounded fontSize="inherit" />
      </IconButton>
      <IconButton
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
        }}
        className={"toolbar-item " + (isUnderline ? "active" : "")}
        aria-label="Format Underline"
      >
        <FormatUnderlinedRounded fontSize="inherit" />
      </IconButton>
      <IconButton
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
        }}
        className={"toolbar-item " + (isStrikethrough ? "active" : "")}
        aria-label="Format Strikethrough"
      >
        <FormatStrikethroughRounded fontSize="inherit" />
      </IconButton>
      <Divider />
      <IconButton
        onClick={() => {
          editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
        }}
        className="toolbar-item"
        aria-label="Decrease Indent"
      >
        <FormatIndentDecreaseRounded fontSize="inherit" />
      </IconButton>
      <IconButton
        onClick={() => {
          editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
        }}
        className="toolbar-item"
        aria-label="Increase Indent"
      >
        <FormatIndentIncreaseRounded fontSize="inherit" />
      </IconButton>
      <Divider />
      <IconButton
        onClick={() => {
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
        }}
        className="toolbar-item"
        aria-label="Bulleted List"
      >
        <FormatListBulletedRounded fontSize="inherit" />
      </IconButton>
      <IconButton
        onClick={() => {
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
        }}
        className="toolbar-item"
        aria-label="Numbered List"
      >
        <FormatListNumberedRounded fontSize="inherit" />
      </IconButton>
      {isAdvanced && (
        <>
          <Divider />
          <LexicalToolbarAlign onAlignmentChange={handleAlignmentChange} />
        </>
      )}
    </Box>
  );
}
