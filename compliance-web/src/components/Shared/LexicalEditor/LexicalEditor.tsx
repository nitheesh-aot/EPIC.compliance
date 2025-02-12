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
// import TableCellResizerPlugin from "./TablePlugins/TableCellResizer";


export type TextEditorValue = {
  html: string;
  text: string;
};

const theme = {
  code: "editor-code",
  heading: {
    h1: "editor-heading-h1",
    h2: "editor-heading-h2",
    h3: "editor-heading-h3",
    h4: "editor-heading-h4",
    h5: "editor-heading-h5",
  },
  image: "editor-image",
  link: "editor-link",
  list: {
    listitem: "editor-listitem",
    nested: {
      listitem: "editor-nested-listitem",
    },
    ol: "editor-list-ol",
    ul: "editor-list-ul",
  },
  ltr: "ltr",
  paragraph: "editor-paragraph",
  placeholder: "editor-placeholder",
  quote: "editor-quote",
  rtl: "rtl",
  text: {
    bold: "editor-text-bold",
    code: "editor-text-code",
    hashtag: "editor-text-hashtag",
    italic: "editor-text-italic",
    overflowed: "editor-text-overflowed",
    strikethrough: "editor-text-strikethrough",
    underline: "editor-text-underline",
    underlineStrikethrough: "editor-text-underlineStrikethrough",
  },
  table: "editor-table",
  tableAlignment: {
    center: "editor-tableAlignmentCenter",
    right: "editor-tableAlignmentRight",
  },
  tableCell: "editor-tableCell",
  tableCellActionButton: "editor-tableCellActionButton",
  tableCellActionButtonContainer: "editor-tableCellActionButtonContainer",
  tableCellHeader: "editor-tableCellHeader",
  tableCellResizer: "editor-tableCellResizer",
  tableCellSelected: "editor-tableCellSelected",
  tableRowStriping: "editor-tableRowStriping",
  tableScrollableWrapper: "editor-tableScrollableWrapper",
  tableSelected: "editor-tableSelected",
  tableSelection: "editor-tableSelection",
};

type LexicalEditorProps = {
  errorMsg?: string;
  placeholder: string;
  defaultHtml?: string;
  label?: string;
  name?: string;
  height?: string;
  isAdvanced?: boolean;
  onChange: (editorState: EditorState, editor: Editor) => void;
};

const LexicalEditor = ({
  errorMsg,
  placeholder,
  defaultHtml = "",
  label = "",
  name,
  height,
  onChange,
  isAdvanced = false,
}: LexicalEditorProps) => {
  // Lexical Editor Configuration
  const editorConfig = {
    namespace: "EAOComplianceEditor",
    theme,
    nodes: [ListNode, ListItemNode, TableNode, TableRowNode, TableCellNode],
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
              <ContentEditable
                className="editor-input"
                aria-placeholder={placeholder}
                placeholder={
                  <div className="editor-placeholder">{placeholder}</div>
                }
              />
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
          {/* <TableCellResizerPlugin /> */}
          <HistoryPlugin />
        </Box>
      </Box>
    </LexicalComposer>
  );
};

export default LexicalEditor;
