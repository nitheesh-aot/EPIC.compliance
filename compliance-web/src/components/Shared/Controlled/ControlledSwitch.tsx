import { FormControlLabel, Switch } from "@mui/material";
import { styled } from "@mui/material/styles";
import { FC } from "react";
import { Controller, useFormContext } from "react-hook-form";

type IFormSwitchProps = {
    name: string;
    label: string;
    isRequired?: boolean;
}
const CustomSwitch = styled(Switch)(({ theme }) => ({
  width: 42,
  height: 26,
  padding: 0,
  marginRight: "0.5rem",
  "& .MuiSwitch-switchBase": {
    padding: 0,
    margin: 2,
    transitionDuration: "300ms",
    "&.Mui-checked": {
      transform: "translateX(16px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: theme.palette.primary.main,
        opacity: 1,
        border: 0,
      },
      "&.Mui-disabled + .MuiSwitch-track": {
        // opacity: 0.5,
        backgroundColor: theme.palette.text.disabled
      },
    },
    "&.Mui-focusVisible .MuiSwitch-thumb": {
    //   color: "#33cf4d",
      border: "6px solid #fff",
    },
    "&.Mui-disabled .MuiSwitch-thumb": {
      color:theme.palette.text.disabled
    },
    "&.Mui-disabled + .MuiSwitch-track": {
      opacity: theme.palette.mode === "light" ? 0.7 : 0.3,
    },
  },
  "& .MuiSwitch-thumb": {
    boxSizing: "border-box",
    width: 22,
    height: 22,
  },
  "& .MuiSwitch-track": {
    borderRadius: 26 / 2,
    backgroundColor: theme.palette.text.disabled,
    opacity: 1,
    transition: theme.transitions.create(["background-color"], {
      duration: 500,
    }),
  },
}));
const ControlledSwitch: FC<IFormSwitchProps> = ({
    name,
    label,
    isRequired = false,
}) => {

  const { control } = useFormContext();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <FormControlLabel
          style={{
            marginLeft: 0,
            fontWeight: isRequired ? "bold" : "normal",
          }}
          control={
            <CustomSwitch
              {...field}
              checked={field.value}
              value={field.value}
              onChange={(event) => field.onChange(event.target.checked)} 
            />
          }
          label={label}
        />
      )}
    />
  );
};

export default ControlledSwitch;
