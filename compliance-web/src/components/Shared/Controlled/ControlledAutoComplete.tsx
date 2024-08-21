import { Autocomplete, TextField, AutocompleteProps } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";

interface FormAutocompleteProps<T>
  extends Partial<AutocompleteProps<T, false, false, false>> {
  name: string;
  label: string;
  options: T[];
  getOptionLabel: (option: T) => string;
  isOptionEqualToValue: (option: T, value: T) => boolean;
}

const ControlledAutoComplete = <T,>({
  name,
  label,
  options,
  getOptionLabel,
  isOptionEqualToValue,
  ...props
}: FormAutocompleteProps<T>) => {
  const {
    control,
    formState: { errors, defaultValues },
  } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValues?.[name] || undefined}
      render={({ field }) => (
        <Autocomplete
          {...field}
          {...props}
          id={name}
          options={options}
          getOptionLabel={getOptionLabel}
          isOptionEqualToValue={isOptionEqualToValue}
          value={field.value ?? null}
          onChange={(_event, newVal) => field.onChange(newVal)}
          renderInput={(params) => (
            <TextField
              {...params}
              label={label}
              name={name}
              error={!!errors[name]}
              helperText={String(errors[name]?.message ?? "")}
            />
          )}
        />
      )}
    />
  );
};

export default ControlledAutoComplete;
