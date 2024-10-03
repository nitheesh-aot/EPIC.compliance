import { Box } from "@mui/material";
import ControlledAutoComplete from "@/components/Shared/Controlled/ControlledAutoComplete";
import { FC, useEffect } from "react";
import { RequirementSource } from "@/models/RequirementSource";
import { BCDesignTokens } from "epic.theme";
import { useFormContext, useWatch } from "react-hook-form";
import { RequirementSourceEnum } from "./ComplaintFormUtils";
import { Topic } from "@/models/Topic";
import { useDrawer } from "@/store/drawerStore";
import DynamicInputField, {
  DynamicInputFieldConfig,
} from "@/components/App/DynamicInputField";

type RequirementSourceFormProps = {
  requirementSourceList: RequirementSource[];
  topicsList: Topic[];
};

const sectionPadding = "1rem 2rem 0rem 1rem";

const RequirementSourceForm: FC<RequirementSourceFormProps> = ({
  requirementSourceList,
  topicsList,
}) => {
  const { isOpen } = useDrawer();
  const { control, resetField, setValue } = useFormContext();

  const selectedRequirementSource = useWatch({
    control,
    name: "requirementSource",
    defaultValue: undefined,
  });

  useEffect(() => {
    // Reset requirementSource when the drawer is closed
    if (!isOpen) {
      setValue("requirementSource", null);
    }
  }, [isOpen, setValue]);

  const handleRequirementSourceChange = () => {
    const fieldName = dynamicFieldConfigRequirementSource[
      selectedRequirementSource?.id as RequirementSourceEnum
    ]?.map((config) => config.name);
    if (fieldName) fieldName.forEach((name) => resetField(name));
  };

  const sharedRequirementSourceField: DynamicInputFieldConfig = {
    type: "text",
    name: "conditionDescription",
    label: "Condition Description",
    required: true,
  };

  const dynamicFieldConfigRequirementSource: Record<
    RequirementSourceEnum,
    DynamicInputFieldConfig[]
  > = {
    [RequirementSourceEnum.SCHEDULE_B]: [
      {
        type: "text",
        name: "conditionNumber",
        label: "Condition #",
        required: true,
      },
    ],
    [RequirementSourceEnum.EAC]: [
      {
        type: "text",
        name: "amendmentNumber",
        label: "Amendment # (optional)",
        required: false,
      },
      {
        type: "text",
        name: "amendmentConditionNumber",
        label: "Amendment Condition # (optional)",
        required: false,
      },
      sharedRequirementSourceField,
    ],
    [RequirementSourceEnum.NOT_EA_ACT]: [
      {
        type: "text",
        name: "notEAActDescription",
        label: "Description",
        required: true,
      },
    ],
    [RequirementSourceEnum.CPD]: [sharedRequirementSourceField],
    [RequirementSourceEnum.ACT2018]: [sharedRequirementSourceField],
    [RequirementSourceEnum.COMPLAINCE_AGREEMENT]: [
      sharedRequirementSourceField,
    ],
    [RequirementSourceEnum.ACT2022]: [sharedRequirementSourceField],
  };

  const isRequirementSourceSelected = Object.values(
    RequirementSourceEnum
  ).includes(selectedRequirementSource?.id as RequirementSourceEnum);

  return (
    <>
      <Box p={sectionPadding} pt={0}>
        <ControlledAutoComplete
          name="requirementSource"
          label="Requirement Source (optional)"
          options={requirementSourceList}
          getOptionLabel={(option) => option.name}
          getOptionKey={(option) => option.id}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          onChange={handleRequirementSourceChange}
          fullWidth
        />
      </Box>
      {isRequirementSourceSelected && (
        <Box
          p={sectionPadding}
          mb={"1.5rem"}
          bgcolor={BCDesignTokens.surfaceColorBackgroundLightBlue}
        >
          {dynamicFieldConfigRequirementSource[
            selectedRequirementSource.id as RequirementSourceEnum
          ]?.map((config) => (
            <DynamicInputField key={config.name} config={config} />
          ))}

          <ControlledAutoComplete
            name="topic"
            label="Topic"
            options={topicsList}
            getOptionLabel={(option) => option.name}
            getOptionKey={(option) => option.id}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            fullWidth
          />
        </Box>
      )}
    </>
  );
};

export default RequirementSourceForm;
