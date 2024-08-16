import { components, DropdownIndicatorProps } from "react-select";
import { BCDesignTokens } from "epic.theme";
import { ExpandMoreRounded } from "@mui/icons-material";

const DropdownIndicator = (props: DropdownIndicatorProps) => {
  return (
    <components.DropdownIndicator {...props}>
      <ExpandMoreRounded
        sx={{
          color: props.hasValue
            ? BCDesignTokens.themeBlue70
            : BCDesignTokens.themeGray100,
        }}
      />
    </components.DropdownIndicator>
  );
};

export default DropdownIndicator;
