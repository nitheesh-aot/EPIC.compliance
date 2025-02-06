import { Grid, Typography, Tooltip } from "@mui/material";
import { BCDesignTokens } from "epic.theme";
import { FC, ReactNode, memo } from "react";

const GridLabelValuePair: FC<{
  label: string;
  value: ReactNode;
  gridProps?: { xs: number };
}> = memo(({ label, value, gridProps = { xs: 12 } }) => (
  <Grid item {...gridProps}>
    <Typography
      variant="body2"
      color={BCDesignTokens.typographyColorPlaceholder}
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
