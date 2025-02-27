import { Grid, Typography, Tooltip } from "@mui/material";
import { BCDesignTokens } from "epic.theme";
import { FC, ReactNode, memo } from "react";

const GridLabelValuePair: FC<{
  label: string;
  value: ReactNode;
  gridProps?: { xs: number };
  isBold?: boolean;
}> = memo(({ label, value, gridProps = { xs: 12 }, isBold = false }) => (
  <Grid item {...gridProps}>
    <Typography
      variant="body2"
      color={isBold ? "inherit" : BCDesignTokens.typographyColorPlaceholder}
      fontWeight={isBold ? 700 : 400}
    >
      {label}
    </Typography>
    <Tooltip title={value}>
      <Typography
        variant="body1"
        sx={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </Typography>
    </Tooltip>
  </Grid>
));

export default GridLabelValuePair;
