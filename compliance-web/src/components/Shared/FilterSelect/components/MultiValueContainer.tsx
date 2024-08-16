import { MultiValueProps } from "react-select";
import { Box, Typography } from "@mui/material";
import { BCDesignTokens } from "epic.theme";

const MultiValue = (props: MultiValueProps) => {
  const { filterProps } = props.selectProps;
  return (
    <>
      {props.index === 0 && props.selectProps.value && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            alignSelf: "stretch",
            borderRadius: "4px",
            background: BCDesignTokens.surfaceColorBackgroundLightBlue,
            cursor: "pointer",
            maxWidth: "70%",
          }}
          key={props.index}
        >
          <Typography
            variant="body2"
            align="left"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              fontWeight: BCDesignTokens.typographyFontWeightsBold,
              color: BCDesignTokens.themeBlue80,
            }}
          >
            {filterProps?.variant === "inline"
              ? "Filtered"
              : `${props.selectProps.placeholder} (${
                  (props.selectProps.value as []).length
                })`}
          </Typography>
        </Box>
      )}
      {props.index === 0 && !filterProps?.selectedOptions && (
        <Typography
          variant="body2"
          align="left"
          sx={{ color: BCDesignTokens.typographyColorPlaceholder }}
        >
          {props.selectProps.placeholder}
        </Typography>
      )}
    </>
  );
};

export default MultiValue;
