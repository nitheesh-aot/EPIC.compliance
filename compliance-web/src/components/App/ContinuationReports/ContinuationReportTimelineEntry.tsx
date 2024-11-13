import TimelineContent from "@mui/lab/TimelineContent";
import { Link, Stack, Typography } from "@mui/material";
import { BCDesignTokens } from "epic.theme";
import { useEffect, useRef, useState } from "react";

export default function ContinuationReportTimelineEntry({
  renderText,
  createdByUser,
  isSystemGenerated,
}: {
  renderText: string;
  createdByUser?: string;
  isSystemGenerated: boolean
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showReadMore, setShowReadMore] = useState(false);

  useEffect(() => {
    if (contentRef.current && contentRef.current.scrollHeight > 170) {
      setShowReadMore(true);
    }
  }, []);

  const handleReadMoreClick = () => {
    setIsExpanded(!isExpanded);
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
          dangerouslySetInnerHTML={{ __html: renderText }}
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
