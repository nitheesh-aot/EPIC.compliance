import { Checkbox, FormControlLabel } from "@mui/material";
import { FC } from "react";
import { Controller, useFormContext } from "react-hook-form";

type IFormCheckboxProps = {
  name: string;
  label: string;
};
const ControlledCheckbox: FC<IFormCheckboxProps> = ({ name, label }) => {
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
          }}
        />
      )}
    />
  );
};

export default ControlledCheckbox;
