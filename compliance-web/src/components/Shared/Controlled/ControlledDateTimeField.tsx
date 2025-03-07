import { FC } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Dayjs } from "dayjs";
import { TextFieldProps } from "@mui/material";
import { DATE_TIME_FORMAT } from "@/utils/constants";
import {
  DateTimePicker,
  DateTimePickerProps,
} from "@mui/x-date-pickers/DateTimePicker";

type IFormDateInputProps = {
  name: string;
  label: string;
  placeHolder?: string;
  isRequired?: boolean;
} & DateTimePickerProps<Dayjs>;

const ControlledDateTimeField: FC<IFormDateInputProps> = ({
  name,
  label,
  placeHolder = DATE_TIME_FORMAT,
  isRequired = false,
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
        <DateTimePicker
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
                sx: {
                  fontWeight: isRequired ? "bold" : "normal",
                },
              },
            } as TextFieldProps,
          }}
          ampm={false}
          {...otherProps}
        />
      )}
    />
  );
};

export default ControlledDateTimeField;
