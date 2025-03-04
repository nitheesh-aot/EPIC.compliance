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
