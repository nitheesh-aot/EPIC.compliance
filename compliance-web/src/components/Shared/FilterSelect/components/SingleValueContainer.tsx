import { SingleValueProps, components } from "react-select";
import { Box, Typography } from "@mui/material";
import { css as emotionCss } from "@emotion/react";
import clsx from "clsx";
import { BCDesignTokens } from "epic.theme";

const SingleValue = (props: SingleValueProps) => {
  return (
    <components.SingleValue {...props}>
      {props.selectProps.value ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            alignSelf: "stretch",
            borderRadius: "4px",
            background: BCDesignTokens.surfaceColorBackgroundLightBlue,
            cursor: "pointer",
          }}
          className={clsx(
            emotionCss(props.getStyles("singleValue", props)),
            props.className
          )}
        >
          <Typography
            variant="body2"
            align="left"
            sx={{
              fontWeight: BCDesignTokens.typographyFontWeightsBold,
              color: BCDesignTokens.themeBlue80,
            }}
          >
            {props.selectProps.filterProps?.variant === "inline"
              ? "Filtered"
              : props.selectProps.placeholder}
          </Typography>
        </Box>
      ) : (
        <Typography
          variant="body2"
          align="left"
          sx={{ color: BCDesignTokens.typographyColorPlaceholder }}
        >
          {props.selectProps.placeholder}
        </Typography>
      )}
    </components.SingleValue>
  );
};

export default SingleValue;
