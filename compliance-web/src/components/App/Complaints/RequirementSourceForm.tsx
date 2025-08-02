import ControlledAutoComplete from "@/components/Shared/Controlled/ControlledAutoComplete";
import ControlledTextField from "@/components/Shared/Controlled/ControlledTextField";
import ConfirmationModal from "@/components/Shared/Popups/ConfirmationModal";
import { InspectionOrder } from "@/models/InspectionOrder";
import { RequirementSource } from "@/models/RequirementSource";
import { useDrawer } from "@/store/drawerStore";
import { useModal } from "@/store/modalStore";
import { RequirementSourceEnum } from "@/utils/constants";
import { Box } from "@mui/material";
import { FC, useEffect, useMemo, useCallback } from "react";
import { useFormContext, useWatch } from "react-hook-form";

type RequirementSourceFormProps = {
  requirementSourceList: RequirementSource[];
  orderList: InspectionOrder[];
};

const RequirementSourceForm: FC<RequirementSourceFormProps> = ({
  requirementSourceList,
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

  // Memoize the field names to avoid recalculation
  const selectedFieldNames = useMemo(() => {
    if (selectedRequirementSource?.id === RequirementSourceEnum.ORDER) {
      return ["order"];
    }
    return ["requirementSourceDescription"];
  }, [selectedRequirementSource?.id]);

  // Memoize the reset function
  const resetFields = useCallback(() => {
    selectedFieldNames.forEach((fieldName) => resetField(fieldName));
  }, [selectedFieldNames, resetField]);

  const handleRequirementSourceChange = useCallback((
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

    // Check if current fields have values
    const hasFieldValues = selectedFieldNames.some(
      (fieldName) => !!getValues(fieldName)
    );

    if (hasFieldValues) {
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
              resetFields();
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
      resetFields();
    }
  }, [selectedRequirementSource, selectedFieldNames, getValues, setValue, setOpen, setClose, resetFields]);

  // Simplified check for requirement source selection
  const isRequirementSourceSelected = selectedRequirementSource?.id && 
    Object.values(RequirementSourceEnum).includes(selectedRequirementSource.id as RequirementSourceEnum);

  return (
    <>
      <Box>
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
        <Box mb={"1.5rem"}>
          {selectedRequirementSource.id === RequirementSourceEnum.ORDER ? (
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
          ) : (
            <ControlledTextField
              name="requirementSourceDescription"
              label="Requirement Details"
              fullWidth
              multiline
              minRows={2}
            />
          )}
        </Box>
      )}
    </>
  );
};

export default RequirementSourceForm;
