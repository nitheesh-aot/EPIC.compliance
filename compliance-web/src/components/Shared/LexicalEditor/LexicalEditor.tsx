import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { Box, InputLabel } from "@mui/material";
import LexicalToolbar from "./LexicalToolbar";
import { EditorState, LexicalEditor as Editor, $isTextNode } from "lexical";
import { $getRoot, $createParagraphNode, $createTextNode } from "lexical";
import { $generateNodesFromDOM } from "@lexical/html";
import { BCDesignTokens } from "epic.theme";
import { ListNode, ListItemNode } from "@lexical/list";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { useState, useMemo } from "react";
import TableCellResizerPlugin from "./TablePlugins/TableCellResizer";
import TableCellActionMenuPlugin from "./TablePlugins/TableActionMenu";
import TableHoverActionsPlugin from "./TablePlugins/TableHoverActions";
import { MentionNode } from "./MentionPlugins/MentionNode";
import MentionsPlugin from "./MentionPlugins/Mentions";
import { LexicalTheme, MentionData } from "./LexicalUtils";
import { PopoverManager } from "./MentionPlugins/PopoverManager";
import { TextNode, DOMConversionMap } from "lexical";
import { parseAllowedFontSize, parseAllowedColor } from "./LexicalUtils";

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
  isRequired?: boolean;
};

function getExtraStyles(element: HTMLElement): string {
  let extraStyles = '';
  const fontSize = parseAllowedFontSize(element.style.fontSize);
  const backgroundColor = parseAllowedColor(element.style.backgroundColor);
  const color = parseAllowedColor(element.style.color);
  
  if (fontSize !== '' && fontSize !== '15px') {
    extraStyles += `font-size: ${fontSize};`;
  }
  if (backgroundColor !== '' && backgroundColor !== 'rgb(255, 255, 255)') {
    extraStyles += `background-color: ${backgroundColor};`;
  }
  if (color !== '' && color !== 'rgb(0, 0, 0)') {
    extraStyles += `color: ${color};`;
  }
  return extraStyles;
}

function buildImportMap(): DOMConversionMap {
  const importMap: DOMConversionMap = {};
  
  for (const [tag, fn] of Object.entries(TextNode.importDOM() || {})) {
    importMap[tag] = (importNode) => {
      const importer = fn(importNode);
      if (!importer) {
        return null;
      }
      return {
        ...importer,
        conversion: (element) => {
          const output = importer.conversion(element);
          if (
            output === null ||
            output.forChild === undefined ||
            output.after !== undefined ||
            output.node !== null
          ) {
            return output;
          }
          const extraStyles = getExtraStyles(element);
          if (extraStyles) {
            const {forChild} = output;
            return {
              ...output,
              forChild: (child, parent) => {
                const textNode = forChild(child, parent);
                if ($isTextNode(textNode)) {
                  textNode.setStyle(textNode.getStyle() + extraStyles);
                }
                return textNode;
              },
            };
          }
          return output;
        },
      };
    };
  }
  return importMap;
}

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
  isRequired = false,
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
    html: {
      import: buildImportMap(),
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

  // Memoize the mentionsList to prevent unnecessary re-renders
  // but ensure it updates when the mentionsList changes
  const memoizedMentionsList = useMemo(
    () => mentionsList || [],
    [mentionsList]
  );

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
            fontWeight: isRequired ? "bold" : "normal",
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
          {memoizedMentionsList.length > 0 && (
            <MentionsPlugin
              mentionsList={memoizedMentionsList}
              key={`mentions-plugin-${memoizedMentionsList.length}`}
            />
          )}
          <HistoryPlugin />
        </Box>
      </Box>
      <PopoverManager />
    </LexicalComposer>
  );
};

export default LexicalEditor;
