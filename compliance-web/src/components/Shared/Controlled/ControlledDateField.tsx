import { FC } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { DatePicker, DatePickerProps } from "@mui/x-date-pickers";
import { Dayjs } from "dayjs";
import { TextFieldProps } from '@mui/material';

type IFormDateInputProps = {
  name: string;
  label: string;
} & DatePickerProps<Dayjs>;

const ControlledDateField: FC<IFormDateInputProps> = ({
  name,
  label,
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
      defaultValue={null}  // Since we're dealing with a date, default to null
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
            } as TextFieldProps,
          }}
          {...otherProps}
        />
      )}
    />
  );
};

export default ControlledDateField;
