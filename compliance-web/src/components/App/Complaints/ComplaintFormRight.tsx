import { Box, Stack } from "@mui/material";
import ControlledAutoComplete from "@/components/Shared/Controlled/ControlledAutoComplete";
import { FC, useEffect } from "react";
import { ComplaintSource } from "@/models/ComplaintSource";
import { RequirementSource } from "@/models/RequirementSource";
import { BCDesignTokens } from "epic.theme";
import { useFormContext, useWatch } from "react-hook-form";
import {
  ComplaintSourceEnum,
  RequirementSourceEnum,
} from "./ComplaintFormUtils";
import { Agency } from "@/models/Agency";
import { FirstNation } from "@/models/FirstNation";
import ContactForm from "@/components/App/ContactForm";
import { Topic } from "@/models/Topic";
import { useDrawer } from "@/store/drawerStore";
import DynamicInputField, {
  DynamicInputFieldConfig,
} from "@/components/App/DynamicInputField";
import { useModal } from "@/store/modalStore";
import ConfirmationModal from "@/components/Shared/Popups/ConfirmationModal";

type ComplaintFormRightProps = {
  complaintSourceList: ComplaintSource[];
  requirementSourceList: RequirementSource[];
  agenciesList: Agency[];
  firstNationsList: FirstNation[];
  topicsList: Topic[];
};

const sectionPadding = "1rem 2rem 0rem 1rem";

const ComplaintFormRight: FC<ComplaintFormRightProps> = ({
  complaintSourceList,
  requirementSourceList,
  agenciesList,
  firstNationsList,
  topicsList,
}) => {
  const { isOpen } = useDrawer();
  const { setOpen, setClose } = useModal();
  const { control, resetField, setValue, getValues } = useFormContext();

  // Watch for changes in `complaintSource` field
  const selectedComplaintSource = useWatch({
    control,
    name: "complaintSource",
    defaultValue: undefined,
  });

  const selectedRequirementSource = useWatch({
    control,
    name: "requirementSource",
    defaultValue: undefined,
  });

  useEffect(() => {
    // Reset requirementSource & complaintSource when the drawer is closed
    if (!isOpen) {
      setValue("requirementSource", null);
      setValue("complaintSource", null);
    }
  }, [isOpen, setValue]);

  const getSelectedFieldNamesComplaintSource = (): string[] => {
    const dynamicFields =
      dynamicFieldConfigComplaintSource[
        selectedComplaintSource?.id as ComplaintSourceEnum
      ];

    const fieldNames: string[] = [
      "contactFullName",
      "contactEmail",
      "contactPhoneNumber",
      "contactComments",
    ];
    if (dynamicFields) {
      fieldNames.push(dynamicFields.name);
    }

    return fieldNames;
  };

  const handleComplaintSourceChange = (
    _event: React.SyntheticEvent,
    newValue: ComplaintSource | ComplaintSource[] | null
  ) => {
    if (
      !selectedComplaintSource ||
      !newValue ||
      selectedComplaintSource.id === (newValue as ComplaintSource).id
    ) {
      setValue("complaintSource", newValue);
      return;
    }
    const isDynamicFieldsNotEmpty = getSelectedFieldNamesComplaintSource().some(
      (fieldName) => !!getValues(fieldName)
    );
    if (isDynamicFieldsNotEmpty) {
      // If dynamic fields contain values, prompt user
      setOpen({
        content: (
          <ConfirmationModal
            title="Change Complaint Source?"
            description="You have entered information for the current complaint source. Changing the complaint source will clear the fields that are specific to this source.
            Are you sure you want to proceed?"
            confirmButtonText="Yes"
            cancelButtonText="No"
            onConfirm={() => {
              resetFieldForComplaintSource();
              setClose();
            }}
            onCancel={() => {
              setValue("complaintSource", selectedComplaintSource);
            }}
          />
        ),
      });
    } else {
      // If dynamic fields are empty, proceed with the change
      setValue("complaintSource", newValue);
      resetFieldForComplaintSource();
    }
  };

  const resetFieldForComplaintSource = () => {
    getSelectedFieldNamesComplaintSource().forEach((fieldName) =>
      resetField(fieldName)
    );
  };

  const handleRequirementSourceChange = () => {
    const fieldName = dynamicFieldConfigRequirementSource[
      selectedRequirementSource?.id as RequirementSourceEnum
    ]?.map((config) => config.name);
    if (fieldName) fieldName.forEach((name) => resetField(name));
  };

  const dynamicFieldConfigComplaintSource: Record<
    ComplaintSourceEnum,
    DynamicInputFieldConfig
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

  const isComplaintSourceSelected: boolean = !!selectedComplaintSource?.id;

  const isRequirementSourceSelected = Object.values(
    RequirementSourceEnum
  ).includes(selectedRequirementSource?.id as RequirementSourceEnum);

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
          {isComplaintSourceSelected && (
            <Box
              p={sectionPadding}
              mb={"1.5rem"}
              bgcolor={BCDesignTokens.surfaceColorBackgroundLightBlue}
            >
              <DynamicInputField
                config={
                  dynamicFieldConfigComplaintSource[
                    selectedComplaintSource?.id as ComplaintSourceEnum
                  ]
                }
              />
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
        </Stack>
      </Box>
    </>
  );
};

export default ComplaintFormRight;
