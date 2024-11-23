import TimelineContent from "@mui/lab/TimelineContent";
import { Link, Stack, Typography } from "@mui/material";
import { BCDesignTokens } from "epic.theme";
import { useEffect, useRef, useState } from "react";

export default function ContinuationReportTimelineEntry({
  renderText,
  createdByUser,
  isSystemGenerated,
  searchText,
}: {
  renderText: string;
  createdByUser?: string;
  isSystemGenerated: boolean;
  searchText?: string;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showReadMore, setShowReadMore] = useState(false);

  useEffect(() => {
    if (contentRef.current && contentRef.current.scrollHeight > 170) {
      setShowReadMore(true);
    }
    setIsExpanded(!!searchText); // if searchText is there, default should be open
  }, [searchText]);

  const handleReadMoreClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const getFormattedText = () => {
    if (!searchText) return renderText;

    // Create a temporary DOM element to parse the HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = renderText;

    // Function to highlight text in a text node
    const highlightTextNode = (node: Text) => {
      const regex = new RegExp(`(${searchText})`, "gi");
      const matches = node.textContent?.match(regex);
      if (!matches) return;

      const fragment = document.createDocumentFragment();
      let lastIndex = 0;
      let match;

      regex.lastIndex = 0; // Reset regex state
      while ((match = regex.exec(node.textContent || "")) !== null) {
        // Add text before match
        fragment.appendChild(
          document.createTextNode(
            node.textContent?.substring(lastIndex, match.index) || ""
          )
        );

        // Add highlighted match
        const highlight = document.createElement("span");
        highlight.style.backgroundColor = "yellow";
        highlight.textContent = match[0];
        fragment.appendChild(highlight);

        lastIndex = regex.lastIndex;
      }

      // Add remaining text
      fragment.appendChild(
        document.createTextNode(node.textContent?.substring(lastIndex) || "")
      );
      node.parentNode?.replaceChild(fragment, node);
    };

    // Recursive function to traverse DOM
    const traverse = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        highlightTextNode(node as Text);
      } else {
        node.childNodes.forEach(traverse);
      }
    };

    traverse(tempDiv);
    return tempDiv.innerHTML;
  };

  return (
    <TimelineContent sx={{ p: "4px 0px 8px 8px" }}>
      <Stack
        ref={contentRef}
        sx={{
          maxHeight: isExpanded ? "none" : "150px",
          overflow: "hidden",
        }}
      >
        <Typography
          variant="subtitle2"
          component={"div"}
          className="quill-render"
          dangerouslySetInnerHTML={{ __html: getFormattedText() }}
        />
        {!isSystemGenerated && createdByUser && (
          <Typography
            variant="subtitle2"
            color={BCDesignTokens.typographyColorDisabled}
          >
            Created by {createdByUser}
          </Typography>
        )}
      </Stack>
      {showReadMore && (
        <Link
          fontSize={BCDesignTokens.typographyFontSizeSmallBody}
          underline="hover"
          sx={{ cursor: "pointer" }}
          onClick={handleReadMoreClick}
        >
          {isExpanded ? "Read Less" : "Read More"}
        </Link>
      )}
    </TimelineContent>
  );
}
