import { Box, FormControlLabel, FormHelperText, Radio, RadioGroup } from "@mui/material";
import { BCDesignTokens } from "epic.theme";
import { FC } from "react";
import { Controller, useFormContext } from "react-hook-form";

type IFormRadioButtonGroupProps = {
  name: string;
  options: Array<{ id: string | number; name: string }>;
  fontSize?: "small" | "medium";
  direction?: "row" | "column";
};
const ControlledRadioButtonGroup: FC<IFormRadioButtonGroupProps> = ({
  name,
  options,
  fontSize = "medium",
  direction = "row",
}) => {
  const { control, formState: { errors } } = useFormContext();
  
  // Get the error for this field if it exists
  const errorMessage = errors[name]?.message as string | undefined;
  
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Box>
          <RadioGroup
            aria-labelledby={`${name}-radio-group`}
            name={name}
            value={field.value}
            onChange={field.onChange}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: direction,
                gap: 1,
              }}
            >
              {options.map((option) => (
                <FormControlLabel
                  key={option.id}
                  value={option.id}
                  control={<Radio />}
                  label={option.name}
                  sx={{
                    fontSize:
                      fontSize === "small"
                        ? BCDesignTokens.typographyFontSizeSmallBody
                        : BCDesignTokens.typographyFontSizeBody,
                  }}
                />
              ))}
            </Box>
          </RadioGroup>
          
          {/* Display error message if exists */}
          {errorMessage && (
            <FormHelperText error>{errorMessage}</FormHelperText>
          )}
        </Box>
      )}
    />
  );
};

export default ControlledRadioButtonGroup;
