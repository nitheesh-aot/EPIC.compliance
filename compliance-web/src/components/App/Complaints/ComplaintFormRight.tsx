import { Box, Stack } from "@mui/material";
import ControlledAutoComplete from "@/components/Shared/Controlled/ControlledAutoComplete";
import { FC, useEffect } from "react";
import { ComplaintSource } from "@/models/ComplaintSource";
import { RequirementSource } from "@/models/RequirementSource";
import { BCDesignTokens } from "epic.theme";
import ControlledTextField from "@/components/Shared/Controlled/ControlledTextField";
import { useDrawer } from "@/store/drawerStore";
import { useModal } from "@/store/modalStore";
import { useFormContext, useWatch } from "react-hook-form";
import { ComplaintSourceEnum } from "./ComplaintFormUtils";
import ConfirmationModal from "@/components/Shared/Popups/ConfirmationModal";
import { Agency } from "@/models/Agency";
import { FirstNation } from "@/models/FirstNation";
import ContactForm from "@/components/App/ContactForm";

type ComplaintFormRightProps = {
  complaintSourceList: ComplaintSource[];
  requirementSourceList: RequirementSource[];
  agenciesList: Agency[];
  firstNationsList: FirstNation[];
};

type FieldConfig = {
  type: string;
  name: string;
  label: string;
  options?: Agency[] | FirstNation[];
};

const sectionPadding = "1rem 2rem 0rem 1rem";

const ComplaintFormRight: FC<ComplaintFormRightProps> = ({
  complaintSourceList,
  requirementSourceList,
  agenciesList,
  firstNationsList,
}) => {
  const { isOpen } = useDrawer();
  const { setOpen, setClose } = useModal();
  const { control, resetField, getValues } = useFormContext();

  // Watch for changes in `complaintSource` field
  const selectedComplaintSource = useWatch({
    control,
    name: "complaintSource",
  });

  useEffect(() => {
    // Reset complaintSource when the drawer is closed
    if (!isOpen) {
      resetField("complaintSource");
    }
  }, [isOpen, resetField]);

  const handleComplaintSourceChange = () => {
    const fieldName =
      dynamicFieldConfig[selectedComplaintSource?.id as ComplaintSourceEnum]
        ?.name;
    const fieldValue = getValues(fieldName);

    if (fieldName && fieldValue) {
      setOpen({
        content: (
          <ConfirmationModal
            title="Remove Group?"
            description="You have selected one or more options in this group. Deselecting will remove all selected items. Are you sure you want to remove it?"
            confirmButtonText="Remove"
            onConfirm={() => handleConfirmRemove(fieldName)}
          />
        ),
      });
    } else {
      handleConfirmRemove(fieldName); // Remove immediately if no values are filled
    }
  };

  const handleConfirmRemove = (fieldName: string) => {
    resetField(fieldName); // Reset the corresponding field value
    setClose();
  };

  const dynamicFieldConfig: Record<ComplaintSourceEnum, FieldConfig> = {
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

  const renderDynamicField = () => {
    const config =
      dynamicFieldConfig[selectedComplaintSource?.id as ComplaintSourceEnum];
    if (!config) return null; // Return null if config is not found

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
              {renderDynamicField()}
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
              fullWidth
            />
          </Box>
        </Stack>
      </Box>
    </>
  );
};

export default ComplaintFormRight;
