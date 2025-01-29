import { components, MultiValueProps } from "react-select";
import { Typography } from "@mui/material";
import { BCDesignTokens } from "epic.theme";

const MultiValue = (props: MultiValueProps) => {
  const { filterProps } = props.selectProps;
  return (
    <components.MultiValueContainer {...props}>
      {props.index === 0 && Array.isArray(props.selectProps.value) && (
        <Typography
          key={props.index}
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
            : `${props.selectProps.placeholder} (${props.selectProps.value.length})`}
        </Typography>
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
    </components.MultiValueContainer>
  );
};

export default MultiValue;
