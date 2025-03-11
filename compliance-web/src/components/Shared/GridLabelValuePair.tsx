import { Grid, Typography, Tooltip } from "@mui/material";
import { BCDesignTokens } from "epic.theme";
import { FC, ReactNode, memo } from "react";

const GridLabelValuePair: FC<{
  label: string;
  value: ReactNode;
  gridProps?: { xs: number };
  isBold?: boolean;
  hideTooltip?: boolean;
  multiline?: boolean;
}> = memo(
  ({
    label,
    value,
    gridProps = { xs: 12 },
    isBold = false,
    hideTooltip = false,
    multiline = false,
  }) => (
    <Grid item {...gridProps}>
      <Typography
        variant="body2"
        color={isBold ? "inherit" : BCDesignTokens.typographyColorPlaceholder}
        fontWeight={isBold ? 700 : 400}
      >
        {label}
      </Typography>
      <Tooltip title={value} disableHoverListener={hideTooltip}>
        <Typography
          variant="body1"
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            ...(multiline && {
              whiteSpace: "normal",
              wordWrap: "break-word",
              display: "flex",
              flexDirection: "column",
              flexWrap: "wrap",
            }),
          }}
        >
          {value}
        </Typography>
      </Tooltip>
    </Grid>
  )
);

export default GridLabelValuePair;
