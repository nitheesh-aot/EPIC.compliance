import { Box, Typography } from "@mui/material";
import { BCDesignTokens } from "epic.theme";

export default function FileProfileProperty({
  propertyName,
  propertyValue,
}: {
  propertyName: string;
  propertyValue?: string;
}) {
  return (
    <Box display={"flex"} gap={4} marginBottom={1}>
      <Typography
        variant="body1"
        color={BCDesignTokens.typographyColorPlaceholder}
        width={120}
      >
        {propertyName}
      </Typography>
      <Typography variant="body1">{propertyValue ?? ""}</Typography>
    </Box>
  );
}
