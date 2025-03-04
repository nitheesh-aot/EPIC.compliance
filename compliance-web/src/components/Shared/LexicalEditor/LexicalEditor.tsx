import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { Box, InputLabel } from "@mui/material";
import LexicalToolbar from "./LexicalToolbar";
import { EditorState, LexicalEditor as Editor } from "lexical";
import { $getRoot, $createParagraphNode, $createTextNode } from "lexical";
import { $generateNodesFromDOM } from "@lexical/html";
import { BCDesignTokens } from "epic.theme";
import { ListNode, ListItemNode } from "@lexical/list";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { useState } from "react";
import TableCellResizerPlugin from "./TablePlugins/TableCellResizer";
import TableCellActionMenuPlugin from "./TablePlugins/TableActionMenu";
import TableHoverActionsPlugin from "./TablePlugins/TableHoverActions";
import { MentionNode } from "./MentionPlugins/MentionNode";
import MentionsPlugin from "./MentionPlugins/Mentions";
import { LexicalTheme, MentionData } from "./LexicalUtils";

export type TextEditorValue = {
  html: string;
  text: string;
};

type LexicalEditorProps = {
  errorMsg?: string;
  placeholder: string;
  defaultHtml?: string;
  label?: string;
  name?: string;
  height?: string;
  isAdvanced?: boolean;
  mentionsList?: MentionData[];
  onChange: (editorState: EditorState, editor: Editor) => void;
};

const LexicalEditor = ({
  errorMsg,
  placeholder,
  defaultHtml = "",
  label = "",
  name,
  height,
  mentionsList,
  onChange,
  isAdvanced = false,
}: LexicalEditorProps) => {
  // Lexical Editor Configuration
  const editorConfig = {
    namespace: "EAOComplianceEditor",
    theme: LexicalTheme,
    nodes: [
      ListNode,
      ListItemNode,
      TableNode,
      TableRowNode,
      TableCellNode,
      MentionNode,
    ],
    onError(error: unknown) {
      // eslint-disable-next-line no-console
      console.error(error);
    },
    editorState: (editor: Editor) => {
      const parser = new DOMParser();
      editor.update(() => {
        // Clear the editor content first
        $getRoot().clear();

        if (defaultHtml) {
          // Parse the HTML string into DOM
          const dom = parser.parseFromString(defaultHtml, "text/html");
          // Convert DOM nodes to Lexical nodes
          const nodes = $generateNodesFromDOM(editor, dom);
          // Insert the nodes
          $getRoot().append(...nodes);
        } else {
          // If no default HTML, create an empty paragraph
          const paragraph = $createParagraphNode();
          paragraph.append($createTextNode(""));
          $getRoot().append(paragraph);
        }
      });
    },
  };

  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  return (
    <LexicalComposer initialConfig={editorConfig}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <InputLabel
          sx={{
            position: "static",
            transform: "none",
            fontSize: "0.875rem",
            lineHeight: "1.5rem",
            color: errorMsg
              ? BCDesignTokens.typographyColorDanger
              : BCDesignTokens.typographyColorPrimary,
          }}
          htmlFor={name}
          size="small"
        >
          {label}
        </InputLabel>
        <LexicalToolbar isAdvanced={isAdvanced} />
      </Box>
      <Box
        className="editor-container"
        sx={{
          border: errorMsg
            ? `1px solid ${BCDesignTokens.supportBorderColorDanger}`
            : `1px solid ${BCDesignTokens.surfaceColorBorderDefault}`,
          height: height ? height : "auto",
          overflowY: "auto",
        }}
      >
        <Box className="editor-inner editor-content">
          <RichTextPlugin
            contentEditable={
              <div ref={onRef}>
                <ContentEditable
                  className="editor-input"
                  aria-placeholder={placeholder}
                  placeholder={
                    <div className="editor-placeholder">{placeholder}</div>
                  }
                />
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <OnChangePlugin onChange={onChange} />
          <ListPlugin />
          <TabIndentationPlugin maxIndent={7} />
          <TablePlugin
            hasCellMerge
            hasCellBackgroundColor
            hasHorizontalScroll
          />
          <TableCellResizerPlugin />
          {floatingAnchorElem && (
            <>
              <TableCellActionMenuPlugin
                anchorElem={floatingAnchorElem}
                cellMerge={true}
              />
              <TableHoverActionsPlugin anchorElem={floatingAnchorElem} />
            </>
          )}
          {mentionsList && (
            <MentionsPlugin mentionsList={mentionsList} />
          )}
          <HistoryPlugin />
        </Box>
      </Box>
    </LexicalComposer>
  );
};

export default LexicalEditor;
