import { Box, Stack } from "@mui/material";
import ControlledAutoComplete from "@/components/Shared/Controlled/ControlledAutoComplete";
import { FC } from "react";
import { ComplaintSource } from "@/models/ComplaintSource";
import { RequirementSource } from "@/models/RequirementSource";
import { BCDesignTokens } from "epic.theme";
import ControlledTextField from "@/components/Shared/Controlled/ControlledTextField";
import { useFormContext, useWatch } from "react-hook-form";
import {
  ComplaintSourceEnum,
  RequirementSourceEnum,
} from "./ComplaintFormUtils";
import { Agency } from "@/models/Agency";
import { FirstNation } from "@/models/FirstNation";
import ContactForm from "@/components/App/ContactForm";
import { Topic } from "@/models/Topic";

type ComplaintFormRightProps = {
  complaintSourceList: ComplaintSource[];
  requirementSourceList: RequirementSource[];
  agenciesList: Agency[];
  firstNationsList: FirstNation[];
  topicsList: Topic[];
};

type FieldConfig = {
  type: string;
  name: string;
  label: string;
  options?: Agency[] | FirstNation[] | Topic[];
  required?: boolean;
};

const sectionPadding = "1rem 2rem 0rem 1rem";

const ComplaintFormRight: FC<ComplaintFormRightProps> = ({
  complaintSourceList,
  requirementSourceList,
  agenciesList,
  firstNationsList,
  topicsList,
}) => {
  const { control, resetField } = useFormContext();

  // Watch for changes in `complaintSource` field
  const selectedComplaintSource = useWatch({
    control,
    name: "complaintSource",
  });

  const selectedRequirementSource = useWatch({
    control,
    name: "requirementSource",
  });

  const handleComplaintSourceChange = () => {
    const fieldName =
      dynamicFieldConfigComplaintSource[
        selectedComplaintSource?.id as ComplaintSourceEnum
      ]?.name;
    resetField(fieldName);
  };

  const handleRequirementSourceChange = () => {
    const fieldName = dynamicFieldConfigRequirementSource[
      selectedRequirementSource?.id as RequirementSourceEnum
    ]?.map((config) => config.name);
    if (fieldName) fieldName.forEach((name) => resetField(name));
  };

  const dynamicFieldConfigComplaintSource: Record<
    ComplaintSourceEnum,
    FieldConfig
  > = {
    [ComplaintSourceEnum.AGENCY]: {
      type: "autocomplete",
      name: "agency",
      label: "Agency",
      options: agenciesList,
    },
    [ComplaintSourceEnum.FIRST_NATION]: {
      type: "autocomplete",
      name: "firstNation",
      label: "First Nation",
      options: firstNationsList,
    },
    [ComplaintSourceEnum.OTHER]: {
      type: "text",
      name: "otherDescription",
      label: "Description",
      options: undefined,
    },
  };

  const sharedRequirementSourceField: FieldConfig = {
    type: "text",
    name: "conditionDescription",
    label: "Condition Description",
    required: true,
  };

  const dynamicFieldConfigRequirementSource: Record<
    RequirementSourceEnum,
    FieldConfig[]
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
        name: "description",
        label: "Description",
        required: true,
      },
    ],
    [RequirementSourceEnum.CPD]: [sharedRequirementSourceField],
    [RequirementSourceEnum.ACT2018]: [sharedRequirementSourceField],
    [RequirementSourceEnum.COMPLAINCE_AGREEMENT]: [sharedRequirementSourceField],
    [RequirementSourceEnum.ACT2022]: [sharedRequirementSourceField],
  };

  const renderDynamicField = (config: FieldConfig) => {
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
        fullWidth
      />
    );
  };

  return (
    <>
      <Box
        sx={{
          width: "399px",
          boxSizing: "border-box",
          overflow: "auto",
        }}
      >
        <Stack>
          <Box p={sectionPadding}>
            <ControlledAutoComplete
              name="complaintSource"
              label="Complaint Source"
              options={complaintSourceList}
              getOptionLabel={(option) => option.name}
              getOptionKey={(option) => option.id}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              onChange={handleComplaintSourceChange}
              fullWidth
            />
          </Box>
          {selectedComplaintSource?.id && (
            <Box
              p={sectionPadding}
              mb={"1.5rem"}
              bgcolor={BCDesignTokens.surfaceColorBackgroundLightBlue}
            >
              {renderDynamicField(
                dynamicFieldConfigComplaintSource[
                  selectedComplaintSource?.id as ComplaintSourceEnum
                ]
              )}
              <ContactForm />
            </Box>
          )}
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
          {selectedRequirementSource?.id && (
            <Box
              p={sectionPadding}
              mb={"1.5rem"}
              bgcolor={BCDesignTokens.surfaceColorBackgroundLightBlue}
            >
              {dynamicFieldConfigRequirementSource[
                selectedRequirementSource.id as RequirementSourceEnum
              ]?.map((config) => renderDynamicField(config))}

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
        </Stack>
      </Box>
    </>
  );
};

export default ComplaintFormRight;
