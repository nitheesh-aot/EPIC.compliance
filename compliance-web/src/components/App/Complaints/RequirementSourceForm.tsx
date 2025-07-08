import DynamicInputField, {
  DynamicInputFieldConfig,
} from "@/components/App/DynamicInputField";
import ControlledAutoComplete from "@/components/Shared/Controlled/ControlledAutoComplete";
import ConfirmationModal from "@/components/Shared/Popups/ConfirmationModal";
import { InspectionOrder } from "@/models/InspectionOrder";
import { RequirementSource } from "@/models/RequirementSource";
import { Topic } from "@/models/Topic";
import { useDrawer } from "@/store/drawerStore";
import { useModal } from "@/store/modalStore";
import { RequirementSourceEnum } from "@/utils/constants";
import { Box } from "@mui/material";
import { BCDesignTokens } from "epic.theme";
import { FC, useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";

type RequirementSourceFormProps = {
  requirementSourceList: RequirementSource[];
  topicsList: Topic[];
  orderList: InspectionOrder[];
};

const sectionPadding = "1rem 2rem 0rem 1rem";

const RequirementSourceForm: FC<RequirementSourceFormProps> = ({
  requirementSourceList,
  topicsList,
  orderList,
}) => {
  const { isOpen } = useDrawer();
  const { setOpen, setClose } = useModal();
  const { control, resetField, setValue, getValues } = useFormContext();

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

  const getSelectedFieldNamesReqSource = (): string[] => {
    const dynamicFields =
      dynamicFieldConfigRequirementSource[
        selectedRequirementSource?.id as RequirementSourceEnum
      ];
    const fieldNames: string[] =
      dynamicFields?.map((field) => field.name) ?? [];
    fieldNames.push("topic");
    return fieldNames;
  };

  const handleRequirementSourceChange = (
    _event: React.SyntheticEvent,
    newValue: RequirementSource | RequirementSource[] | null
  ) => {
    if (
      !selectedRequirementSource ||
      !newValue ||
      selectedRequirementSource.id === (newValue as RequirementSource).id
    ) {
      setValue("requirementSource", newValue);
      return;
    }
    const isDynamicFieldsNotEmpty = getSelectedFieldNamesReqSource().some(
      (fieldName) => !!getValues(fieldName)
    );
    if (isDynamicFieldsNotEmpty) {
      // If dynamic fields contain values, prompt user
      setOpen({
        content: (
          <ConfirmationModal
            title="Change Requirement Source?"
            description="You have entered information for the current requirement source. Changing the requirement source will clear the fields that are specific to this source.
            Are you sure you want to proceed?"
            confirmButtonText="Yes"
            cancelButtonText="No"
            onConfirm={() => {
              resetFieldForReqSource();
              setClose();
            }}
            onCancel={() => {
              setValue("requirementSource", selectedRequirementSource);
            }}
          />
        ),
      });
    } else {
      // If dynamic fields are empty, proceed with the change
      setValue("requirementSource", newValue);
      resetFieldForReqSource();
    }
  };

  const resetFieldForReqSource = () => {
    getSelectedFieldNamesReqSource().forEach((fieldName) =>
      resetField(fieldName)
    );
  };

  const sharedRequirementSourceField = (
    name?: string,
    label?: string
  ): DynamicInputFieldConfig => {
    return {
      type: "text",
      name: name ?? "conditionDescription",
      label: `${label ?? "Condition Description"}`,
      required: false,
    };
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
        label: "Amendment #",
        required: false,
      },
      {
        type: "text",
        name: "amendmentConditionNumber",
        label: "Amendment Condition #",
        required: false,
      },
      sharedRequirementSourceField(),
    ],
    [RequirementSourceEnum.CPD]: [sharedRequirementSourceField()],
    [RequirementSourceEnum.ACT2018]: [sharedRequirementSourceField()],
    [RequirementSourceEnum.COMPLAINCE_AGREEMENT]: [
      sharedRequirementSourceField(),
    ],
    [RequirementSourceEnum.ACT2022]: [sharedRequirementSourceField()],
    [RequirementSourceEnum.OTHER]: [
      sharedRequirementSourceField("description", "Description"),
    ],
    [RequirementSourceEnum.EACA]: [sharedRequirementSourceField()],
    [RequirementSourceEnum.ORDER]: [],
  };

  const isRequirementSourceSelected = Object.values(
    RequirementSourceEnum
  ).includes(selectedRequirementSource?.id as RequirementSourceEnum);

  return (
    <>
      <Box p={sectionPadding} pt={0}>
        <ControlledAutoComplete
          name="requirementSource"
          label="Requirement Source"
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

          {selectedRequirementSource.id === RequirementSourceEnum.ORDER && (
            <ControlledAutoComplete
              name="order"
              label="Order"
              options={orderList ?? []}
              getOptionLabel={(option) => option.order_number ?? ""}
              getOptionKey={(option) => option.id ?? ""}
              isOptionEqualToValue={(option, value) =>
                option.id?.toString() === value.id?.toString()
              }
              fullWidth
              isRequired={true}
            />
          )}
          <ControlledAutoComplete
            name="topic"
            label="Topic"
            options={topicsList}
            getOptionLabel={(option) => option.name}
            getOptionKey={(option) => option.id}
            isOptionEqualToValue={(option, value) =>
              option.id.toString() === value.id.toString()
            }
            fullWidth
            isRequired={true}
          />
        </Box>
      )}
    </>
  );
};

export default RequirementSourceForm;
