import { $getSelection, LexicalEditor } from "lexical";
import { $patchStyleText } from "@lexical/selection";

export const MIN_ALLOWED_FONT_SIZE = 8;
export const MAX_ALLOWED_FONT_SIZE = 72;
export const DEFAULT_FONT_SIZE = 15;

export type MentionData = {
  id: number;
  name: string;
  imageUrl?: string;
};

export const LexicalTheme = {
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
    olDepth: [
      "editor-list-ol1",
      "editor-list-ol2",
      "editor-list-ol3",
      "editor-list-ol4",
      "editor-list-ol5",
    ],
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

export const calculateNextFontSize = (
  currentFontSize: number,
  updateType: UpdateFontSizeType | null
) => {
  if (!updateType) {
    return currentFontSize;
  }

  let updatedFontSize: number = currentFontSize;
  switch (updateType) {
    case UpdateFontSizeType.decrement:
      switch (true) {
        case currentFontSize > MAX_ALLOWED_FONT_SIZE:
          updatedFontSize = MAX_ALLOWED_FONT_SIZE;
          break;
        case currentFontSize >= 48:
          updatedFontSize -= 12;
          break;
        case currentFontSize >= 24:
          updatedFontSize -= 4;
          break;
        case currentFontSize >= 14:
          updatedFontSize -= 2;
          break;
        case currentFontSize >= 9:
          updatedFontSize -= 1;
          break;
        default:
          updatedFontSize = MIN_ALLOWED_FONT_SIZE;
          break;
      }
      break;

    case UpdateFontSizeType.increment:
      switch (true) {
        case currentFontSize < MIN_ALLOWED_FONT_SIZE:
          updatedFontSize = MIN_ALLOWED_FONT_SIZE;
          break;
        case currentFontSize < 12:
          updatedFontSize += 1;
          break;
        case currentFontSize < 20:
          updatedFontSize += 2;
          break;
        case currentFontSize < 36:
          updatedFontSize += 4;
          break;
        case currentFontSize <= 60:
          updatedFontSize += 12;
          break;
        default:
          updatedFontSize = MAX_ALLOWED_FONT_SIZE;
          break;
      }
      break;

    default:
      break;
  }
  return updatedFontSize;
};

export const updateFontSize = (
  editor: LexicalEditor,
  updateType: UpdateFontSizeType,
  inputValue: string
) => {
  if (inputValue !== "") {
    const nextFontSize = calculateNextFontSize(Number(inputValue), updateType);
    updateFontSizeInSelection(editor, String(nextFontSize) + "px", null);
  } else {
    updateFontSizeInSelection(editor, null, updateType);
  }
};

export const updateFontSizeInSelection = (
  editor: LexicalEditor,
  newFontSize: string | null,
  updateType: UpdateFontSizeType | null
) => {
  const getNextFontSize = (prevFontSize: string | null): string => {
    if (!prevFontSize) {
      prevFontSize = `${DEFAULT_FONT_SIZE}px`;
    }
    prevFontSize = prevFontSize.slice(0, -2);
    const nextFontSize = calculateNextFontSize(
      Number(prevFontSize),
      updateType
    );
    return `${nextFontSize}px`;
  };

  editor.update(() => {
    if (editor.isEditable()) {
      const selection = $getSelection();
      if (selection !== null) {
        $patchStyleText(selection, {
          "font-size": newFontSize || getNextFontSize,
        });
      }
    }
  });
};

export enum UpdateFontSizeType {
  increment = 1,
  decrement,
}

export function parseAllowedFontSize(fontSize: string): string {
  if (!fontSize) return '';
  // Add your font size validation logic here
  // Example: only allow px values between 8px and 48px
  const size = parseInt(fontSize);
  if (isNaN(size)) return '';
  if (size < 8 || size > 48) return '';
  return fontSize;
}

export function parseAllowedColor(color: string): string {
  if (!color) return '';
  // Add your color validation logic here
  // Example: only allow rgb values
  if (color.startsWith('rgb(') && color.endsWith(')')) {
    return color;
  }
  return '';
}


