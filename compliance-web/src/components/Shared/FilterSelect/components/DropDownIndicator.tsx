import { components, DropdownIndicatorProps } from "react-select";
import { BCDesignTokens } from "epic.theme";
import { ArrowForwardIosRounded } from "@mui/icons-material";

const DropdownIndicator = (props: DropdownIndicatorProps) => {
  return (
    <components.DropdownIndicator {...props}>
      {props.selectProps.menuIsOpen}
      <ArrowForwardIosRounded
        sx={{
          color: props.hasValue
            ? BCDesignTokens.surfaceColorBorderActive
            : BCDesignTokens.surfaceColorBorderMedium,
          height: "1.25rem",
          transform: props.selectProps.menuIsOpen ? "rotate(270deg)" : "rotate(90deg)"
        }}
      />
    </components.DropdownIndicator>
  );
};

export default DropdownIndicator;
