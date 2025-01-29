import { SingleValueProps, components } from "react-select";
import { Typography } from "@mui/material";
import { BCDesignTokens } from "epic.theme";

const SingleValue = (props: SingleValueProps) => {
  return (
    <components.SingleValue {...props}>
      {props.selectProps.value ? (
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
