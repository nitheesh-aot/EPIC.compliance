import { FC } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { TextFieldProps } from "@mui/material";
import DateRangePicker, { DateRange } from "./DateRangePicker";
import { DATE_FORMAT } from "@/utils/constants";

type IFormDateRangeInputProps = {
  name: string;
  label: string;
  placeHolder?: string;
} & TextFieldProps;

const ControlledDateRangePicker: FC<IFormDateRangeInputProps> = ({
  name,
  label,
  placeHolder = `${DATE_FORMAT} — ${DATE_FORMAT}`,
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
      defaultValue={{ startDate: null, endDate: null }}
      render={({ field }) => (
        <DateRangePicker
          {...field}
          value={field.value}
          label={label}
          onDateChange={(value: DateRange) => {
            field.onChange(value);
          }}
          error={!!errors[name]}
          helperText={String(
            errors[name] && "startDate" in errors[name]
              ? (errors[name].startDate?.message as string)
              : errors[name] && "endDate" in errors[name]
                ? (errors[name].endDate?.message as string)
                : errors[name]?.message || ""
          )}
          placeholder={placeHolder}
          {...otherProps}
        />
      )}
    />
  );
};

export default ControlledDateRangePicker;
