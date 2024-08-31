import { FC } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { TextFieldProps } from "@mui/material";
import DateRangePicker, { DateRange } from "./DateRangePicker";

type IFormDateRangeInputProps = {
  name: string;
  label: string;
} & TextFieldProps;

const ControlledDateRangePicker: FC<IFormDateRangeInputProps> = ({
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
      defaultValue={{ startDate: null, endDate: null }} // DateRange default value
      render={({ field }) => (
        <DateRangePicker
          {...field}
          value={field.value}
          label={label}
          onDateChange={(value: DateRange) => {
            field.onChange(value);
          }}
          error={!!errors[name]}
          helperText={String(errors[name]?.message ?? "")}
          {...otherProps}
        />
      )}
    />
  );
};

export default ControlledDateRangePicker;
