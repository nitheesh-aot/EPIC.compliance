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
  const [isExpanded, setIsExpanded] = useState(!!searchText);  // if searchText is there, default should be open
  const [showReadMore, setShowReadMore] = useState(false);

  useEffect(() => {
    if (contentRef.current && contentRef.current.scrollHeight > 170) {
      setShowReadMore(true);
    }
  }, []);

  const handleReadMoreClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const getFormattedText = () => {
    if (!searchText) return renderText; // If no searchText to highlight, return the original renderText
    const regex = new RegExp(`(${searchText})`, "g"); // Case-insensitive regex for the word
    return renderText.replace(
      regex,
      `<span style="background-color: yellow;">${searchText}</span>`
    );
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
