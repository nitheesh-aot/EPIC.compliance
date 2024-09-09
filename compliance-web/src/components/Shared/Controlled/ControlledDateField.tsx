import { FC } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { DatePicker, DatePickerProps } from "@mui/x-date-pickers";
import { Dayjs } from "dayjs";
import { TextFieldProps } from '@mui/material';

type IFormDateInputProps = {
  name: string;
  label: string;
  placeHolder?: string;
} & DatePickerProps<Dayjs>;

const ControlledDateField: FC<IFormDateInputProps> = ({
  name,
  label,
  placeHolder = "YYYY-MM-DD",
  ...otherProps
}) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={null}
      render={({ field }) => (
        <DatePicker
          {...field}
          label={label}
          onChange={(date: Dayjs | null) => {
            field.onChange(date);
          }}
          slotProps={{
            textField: {
              error: !!errors[name],
              helperText: errors[name] ? String(errors[name]?.message) : "",
              placeholder: placeHolder,
              InputLabelProps: {
                shrink: true, // for always display the placeholder
              }
            } as TextFieldProps,
          }}
          {...otherProps}
        />
      )}
    />
  );
};

export default ControlledDateField;
