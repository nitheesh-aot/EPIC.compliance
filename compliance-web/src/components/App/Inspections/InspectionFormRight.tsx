import { Box, Stack } from "@mui/material";
import ControlledAutoComplete from "@/components/Shared/Controlled/ControlledAutoComplete";
import { IRStatus } from "@/models/IRStatus";
import { ProjectStatus } from "@/models/ProjectStatus";
import { FC, useState } from "react";
import { Attendance } from "@/models/Attendance";
import ControlledTextField from "@/components/Shared/Controlled/ControlledTextField";
import { BCDesignTokens } from "epic.theme";
import { Agency } from "@/models/Agency";
import { FirstNation } from "@/models/FirstNation";
import { useFormContext, useWatch } from "react-hook-form";
import { useModal } from "@/store/modalStore";
import ConfirmationModal from "@/components/Shared/Popups/ConfirmationModal";

type InspectionFormRightProps = {
  irStatusList: IRStatus[];
  projectStatusList: ProjectStatus[];
  attendanceList: Attendance[];
  agenciesList: Agency[];
  firstNationsList: FirstNation[];
};

type FieldConfig = {
  type: string;
  name: string;
  label: string;
  options?: Agency[] | FirstNation[];
};

enum AttendanceEnum {
  AGENCIES = 1,
  FIRST_NATIONS,
  MUNICIPAL,
  OTHER = 7,
}

const sectionPadding = "1rem 2rem 0rem 1rem";

const InspectionFormRight: FC<InspectionFormRightProps> = ({
  irStatusList,
  projectStatusList,
  attendanceList,
  agenciesList,
  firstNationsList,
}) => {
  const { setOpen, setClose } = useModal();
  const { control, resetField, getValues, setValue } = useFormContext();
  const [selectedAttendance, setSelectedAttendance] = useState<Attendance[]>(
    []
  );

  // Watch for changes in form fields
  const formValues = useWatch({ control });

  const handleAttendanceChange = (selected: Attendance[]) => {
    setSelectedAttendance(selected); // Directly update without deselecting items
  };

  const handleDeleteOption = (option: Attendance) => {
    const fieldName = dynamicFieldConfig[option.id as AttendanceEnum]?.name;
    const fieldValue = formValues[fieldName];
    
    if (fieldName && fieldValue?.length) {
      setOpen({
        content: (
          <ConfirmationModal
            title="Remove Group?"
            description="You have selected one or more options in this group. Deselecting will remove all selected items. Are you sure you want to remove it?"
            confirmButtonText="Remove"
            onConfirm={() => handleConfirmRemove(option)}
          />
        ),
      });
    } else {
      handleConfirmRemove(option); // Remove immediately if no values are filled
    }
  };

  const handleConfirmRemove = (selectedToRemove: Attendance) => {
    if (selectedToRemove) {
      const fieldName = dynamicFieldConfig[selectedToRemove.id as AttendanceEnum]?.name;
      if (fieldName) {
        resetField(fieldName); // Reset the corresponding field value
      }
      const inAttendanceValues: Attendance[] = getValues("inAttendance");
      const updatedAttendanceList: Attendance[] = inAttendanceValues.filter((att) => att.id !== selectedToRemove.id)
      setSelectedAttendance(updatedAttendanceList); // Remove the deselected item from state      
      setValue("inAttendance", updatedAttendanceList);
    }
    setClose();
  };

  const dynamicFieldConfig: Record<AttendanceEnum, FieldConfig> = {
    [AttendanceEnum.AGENCIES]: {
      type: "autocomplete",
      name: "agencies",
      label: "Agencies",
      options: agenciesList,
    },
    [AttendanceEnum.FIRST_NATIONS]: {
      type: "autocomplete",
      name: "firstNations",
      label: "First Nations",
      options: firstNationsList,
    },
    [AttendanceEnum.MUNICIPAL]: {
      type: "text",
      name: "municipal",
      label: "Municipal",
    },
    [AttendanceEnum.OTHER]: { type: "text", name: "other", label: "Other" },
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
              name="irStatus"
              label="IR Status (optional)"
              options={irStatusList}
              getOptionLabel={(option) => option.name}
              getOptionKey={(option) => option.id}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              fullWidth
            />
            <ControlledAutoComplete
              name="projectStatus"
              label="Project Status (optional)"
              options={projectStatusList}
              getOptionLabel={(option) => option.name}
              getOptionKey={(option) => option.id}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              fullWidth
            />
            <ControlledAutoComplete
              name="inAttendance"
              label="In Attendance (optional)"
              options={attendanceList}
              getOptionLabel={(option) => option.name}
              getOptionKey={(option) => option.id}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              multiple
              fullWidth
              onChange={(_, newVal) => handleAttendanceChange(newVal as Attendance[])}
              onDeleteOption={handleDeleteOption}
            />
          </Box>
          {/* Show this section only if in-attendance is selected */}
          {selectedAttendance?.length > 0 && (
            <Box
              p={sectionPadding}
              bgcolor={BCDesignTokens.surfaceColorBackgroundLightBlue}
            >
              {selectedAttendance.map((attendee) => {
                const config = dynamicFieldConfig[attendee.id as AttendanceEnum];
                if (!config) return null;

                return config.type === "text" ? (
                  <ControlledTextField
                    key={config.name}
                    name={config.name}
                    label={config.label}
                    placeholder={`Type ${config.label.toLowerCase()} attendees`}
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
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    multiple
                    fullWidth
                  />
                );
              })}
            </Box>
          )}
        </Stack>
      </Box>
    </>
  );
};

export default InspectionFormRight;
