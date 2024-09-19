import React, { FC } from "react";
import { TextField, TextFieldProps } from "@mui/material";
import {
  Controller,
  ControllerRenderProps,
  useFormContext,
} from "react-hook-form";
import { IMaskInput } from "react-imask";

// Type for the masked input props
interface CustomMaskedInputProps {
  mask: string;
  definitions?: Record<string, RegExp>;
  inputRef: React.Ref<unknown>;
  onChange: (value: string) => void;
}

const CustomMaskedInput = React.forwardRef<
  HTMLInputElement,
  CustomMaskedInputProps
>(function CustomMaskedInput(props, ref) {
  const { mask, definitions, onChange, ...other } = props;

  return (
    <IMaskInput
      {...other}
      mask={mask}
      definitions={definitions}
      inputRef={ref}
      onAccept={onChange} // Directly handle masked input change
    />
  );
});

type IFormInputProps = {
  name: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputEffects?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => string;
  maxLength?: number;
  mask?: string;
} & TextFieldProps;

const ControlledTextField: FC<IFormInputProps> = ({
  name,
  inputEffects,
  maxLength,
  onChange: onInputChange,
  mask,
  ...otherProps
}) => {
  const {
    control,
    formState: { errors, defaultValues },
  } = useFormContext();

  const handleChange = (
    field: ControllerRenderProps
  ): React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> => {
    return (e) => {
      if (onInputChange) {
        onInputChange(e);
      }
      if (inputEffects) {
        e.target.value = inputEffects(e);
      }
      const value = typeof e === "string" ? e : e.target.value;
      field.onChange(value);
    };
  };

  return (
    <Controller
      control={control}
      name={name}
      defaultValue={defaultValues?.[name] || ""}
      render={({ field }) => {
        const inputProps = mask
          ? {
              inputComponent:
                CustomMaskedInput as unknown as React.ComponentType,
              inputProps: { mask },
            }
          : {};

        return (
          <TextField
            {...field}
            inputRef={field.ref} // Use field ref directly
            inputProps={{
              maxLength,
              ...otherProps.inputProps,
            }}
            onChange={handleChange(field)}
            error={!!errors[name]}
            helperText={String(errors[name]?.message ?? "")}
            InputLabelProps={{
              shrink: true,
            }}
            InputProps={inputProps}
            {...otherProps}
          />
        );
      }}
    />
  );
};

export default ControlledTextField;
