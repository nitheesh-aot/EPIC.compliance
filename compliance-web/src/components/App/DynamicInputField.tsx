import { FC } from "react";
import ControlledTextField from "@/components/Shared/Controlled/ControlledTextField";
import ControlledAutoComplete from "@/components/Shared/Controlled/ControlledAutoComplete";
import { Agency } from "@/models/Agency";
import { FirstNation } from "@/models/FirstNation";
import { Topic } from "@/models/Topic";

export type DynamicInputFieldConfig = {
  type: string;
  name: string;
  label: string;
  options?: Agency[] | FirstNation[] | Topic[];
  required?: boolean;
  multiple?: boolean;
};

type DynamicInputFieldProps = {
  config: DynamicInputFieldConfig;
};

const DynamicInputField: FC<DynamicInputFieldProps> = ({ config }) => {
  if (!config) return;
  return config.type === "text" ? (
    <ControlledTextField
      key={config.name}
      name={config.name}
      label={config.label}
      fullWidth
      multiline
    />
  ) : (
    <ControlledAutoComplete
      key={config.name}
      name={config.name}
      label={config.label}
      options={config.options ?? []}
      getOptionLabel={(option) => option.name}
      getOptionKey={(option) => option.id}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      multiple={config.multiple}
      fullWidth
    />
  );
};

export default DynamicInputField;
