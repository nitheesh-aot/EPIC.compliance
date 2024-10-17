import { Box, Typography } from "@mui/material";
import { BCDesignTokens } from "epic.theme";

export default function FileProfileProperty({
  propertyName,
  propertyValue,
  size = "default",
}: {
  propertyName: string;
  propertyValue?: string;
  size?: "small" | "default";
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
      <Typography variant="body1">{propertyValue ?? ""}</Typography>
    </Box>
  );
}
