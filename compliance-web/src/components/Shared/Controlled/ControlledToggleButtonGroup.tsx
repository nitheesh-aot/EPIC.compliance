import { FC } from "react";
import {
  ToggleButton,
  ToggleButtonGroup,
  ToggleButtonGroupProps,
  SxProps,
} from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";
import { CheckRounded } from "@mui/icons-material";
import { BCDesignTokens } from "epic.theme";

interface ControlledToggleButtonGroupProps
  extends Omit<ToggleButtonGroupProps, "value" | "onChange"> {
  name: string;
  options: Array<{ id: string | number; name: string }>;
  sx?: SxProps;
  disabled?: boolean;
}

const ControlledToggleButtonGroup: FC<ControlledToggleButtonGroupProps> = ({
  name,
  options,
  sx,
  disabled,
  ...rest
}) => {
  const { control } = useFormContext();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange } }) => (
        <ToggleButtonGroup
          value={value}
          exclusive
          onChange={(_event, newValue) => onChange(newValue)}
          disabled={disabled}
          sx={{
            marginBottom: "1rem",
            height: "2.5rem",
            backgroundColor: BCDesignTokens.surfaceColorBackgroundWhite,
            ...sx,
          }}
          {...rest}
        >
          {options.map((option) => (
            <ToggleButton
              key={option.id}
              value={option}
              aria-label={option.name}
              selected={option.id === value?.id}
              sx={{
                border: `1px solid ${BCDesignTokens.surfaceColorBorderDefault}`,
                paddingX: "1rem",
                "&.Mui-selected": {
                  border: `1px solid ${BCDesignTokens.surfaceColorBorderDark}`,
                },
                "&.MuiToggleButtonGroup-lastButton.Mui-disabled": {
                  borderLeft: `1px solid ${BCDesignTokens.surfaceColorBorderDark}`,
                },
              }}
            >
              {option.name}
              {option.id === value?.id && (
                <CheckRounded sx={{ marginLeft: "0.5rem" }} fontSize="small" />
              )}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      )}
    />
  );
};

export default ControlledToggleButtonGroup;
