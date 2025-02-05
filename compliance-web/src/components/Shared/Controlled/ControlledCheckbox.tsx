import { Checkbox, FormControlLabel } from "@mui/material";
import { BCDesignTokens } from "epic.theme";
import { FC } from "react";
import { Controller, useFormContext } from "react-hook-form";

type IFormCheckboxProps = {
  name: string;
  label: string;
  fontSize?: "small" | "medium";
};
const ControlledCheckbox: FC<IFormCheckboxProps> = ({
  name,
  label,
  fontSize = "medium",
}) => {
  const { control } = useFormContext();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <FormControlLabel
          control={
            <Checkbox
              {...field}
              checked={field.value ?? false}
              value={field.value}
              onChange={(event) => field.onChange(event.target.checked)}
              sx={{
                paddingY: 0,
              }}
            />
          }
          label={label}
          sx={{
            marginBottom: "1.5rem",
            "& .MuiFormControlLabel-label": {
              fontSize:
                fontSize === "small"
                  ? BCDesignTokens.typographyFontSizeSmallBody
                  : BCDesignTokens.typographyFontSizeBody,
            },
          }}
        />
      )}
    />
  );
};

export default ControlledCheckbox;
