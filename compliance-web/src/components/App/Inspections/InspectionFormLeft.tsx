import { FC } from "react";
import { Box, Stack } from "@mui/material";
import { StaffUser } from "@/models/Staff";
import ControlledAutoComplete from "@/components/Shared/Controlled/ControlledAutoComplete";
import { BCDesignTokens } from "epic.theme";
import { Initiation } from "@/models/Initiation";
import ControlledTextField from "@/components/Shared/Controlled/ControlledTextField";
import { IRType } from "@/models/IRType";
import { IRStatus } from "@/models/IRStatus";
import { ProjectStatus } from "@/models/ProjectStatus";
import ControlledDateField from "@/components/Shared/Controlled/ControlledDateField";
import { useFormContext } from "react-hook-form";

type InspectionFormLeftProps = {
  initiationList: Initiation[];
  staffUsersList: StaffUser[];
  irTypeList: IRType[];
  irStatusList: IRStatus[];
  projectStatusList: ProjectStatus[];
};

const InspectionFormLeft: FC<InspectionFormLeftProps> = ({
  initiationList,
  staffUsersList,
  irTypeList,
  irStatusList,
  projectStatusList,
}) => {
  const { watch } = useFormContext();
  const startDate = watch("startDate");
  const endDate = watch("endDate");

  return (
    <>
      <Box
        sx={{
          background: BCDesignTokens.surfaceColorBackgroundLightGray,
          padding: "1rem 1rem 1rem 2rem",
          width: "718px",
          overflow: "auto",
          boxSizing: "border-box",
        }}
      >
        <ControlledTextField
          name="projectDescription"
          label="Project Description"
          placeholder="Project Description"
          multiline
          fullWidth
          minRows={4}
        />
        <ControlledTextField
          name="locationDescription"
          label="Location Description (optional)"
          placeholder="Specify inspected location"
          multiline
          fullWidth
          minRows={2}
        />
        <ControlledTextField
          name="utm"
          label="UTM (optional)"
          placeholder="eg. 9U 454135 6399452"
          fullWidth
        />
        <Stack direction={"row"} gap={2}>
          <ControlledAutoComplete
            name="primaryOfficer"
            label="Primary"
            options={staffUsersList}
            getOptionLabel={(option) => option.name}
            getOptionKey={(option) => option.id}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            fullWidth
          />
          <ControlledAutoComplete
            name="initiation"
            label="Initiation"
            options={initiationList}
            getOptionLabel={(option) => option.name}
            getOptionKey={(option) => option.id}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            fullWidth
          />
        </Stack>
        <Stack direction={"row"} gap={2}>
          <ControlledAutoComplete
            name="irTypes"
            label="Type"
            options={irTypeList}
            getOptionLabel={(option) => option.name}
            getOptionKey={(option) => option.id}
            isOptionEqualToValue={(option, value) =>
              option.id.toString() === value.id.toString()
            }
            multiple
            fullWidth
          />
          <Stack direction={"row"} gap={2} sx={{ width: "100%" }}>
            <ControlledDateField
              name="startDate"
              label="Start Date"
              maxDate={endDate}
            />
            <ControlledDateField
              name="endDate"
              label="End Date (optional)"
              minDate={startDate}
            />
          </Stack>
        </Stack>
        <Stack direction={"row"} gap={2}>
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
        </Stack>
      </Box>
    </>
  );
};

export default InspectionFormLeft;
