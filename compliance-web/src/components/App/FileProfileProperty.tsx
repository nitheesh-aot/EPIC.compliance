import { Box, Typography } from "@mui/material";
import { BCDesignTokens } from "epic.theme";
import ParagraphWithReadMore from "../Shared/ParagraphWithReadMore";

export default function FileProfileProperty({
  propertyName,
  propertyValue,
  size = "default",
  expandable = false,
}: {
  propertyName: string;
  propertyValue?: string;
  size?: "small" | "default";
  expandable?: boolean;
}) {
  return (
    <Box display={"flex"} gap={size === "small" ? 4 : 2} marginBottom={1}>
      <Typography
        variant="body1"
        color={BCDesignTokens.typographyColorPlaceholder}
        width={size === "small" ? 120 : 180}
      >
        {propertyName}
      </Typography>
      {expandable ? (
        <ParagraphWithReadMore
          maxHeight={84}
          renderTypography={
            <Typography variant="body1" display={"flex"} flex={1}>
              {propertyValue ?? ""}
            </Typography>
          }
        />
      ) : (
        <Typography variant="body1" display={"flex"} flex={1}>
          {propertyValue ?? ""}
        </Typography>
      )}
    </Box>
  );
}
