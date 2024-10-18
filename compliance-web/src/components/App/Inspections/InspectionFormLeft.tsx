import { FC } from "react";
import { Box, Stack } from "@mui/material";
import { StaffUser } from "@/models/Staff";
import ControlledAutoComplete from "@/components/Shared/Controlled/ControlledAutoComplete";
import { BCDesignTokens } from "epic.theme";
import { Project } from "@/models/Project";
import { Initiation } from "@/models/Initiation";
import ControlledTextField from "@/components/Shared/Controlled/ControlledTextField";
import { IRType } from "@/models/IRType";
import ControlledDateRangePicker from "@/components/Shared/Controlled/ControlledDateRangePicker";
import ProjectDetailsForm from "@/components/App/ProjectDetailsForm";

type InspectionFormLeftProps = {
  projectList: Project[];
  initiationList: Initiation[];
  staffUsersList: StaffUser[];
  irTypeList: IRType[];
  isEditMode?: boolean;
};

const InspectionFormLeft: FC<InspectionFormLeftProps> = ({
  projectList,
  initiationList,
  staffUsersList,
  irTypeList,
  isEditMode,
}) => {
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
        <ProjectDetailsForm projectList={projectList} isEditMode={isEditMode} />
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
            name="leadOfficer"
            label="Lead Officer"
            options={staffUsersList}
            getOptionLabel={(option) => option.full_name ?? ""}
            getOptionKey={(option) => option.id}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            fullWidth
          />
          <ControlledAutoComplete
            name="officers"
            label="Other Officers (optional)"
            options={staffUsersList}
            getOptionLabel={(option) => option.full_name ?? ""}
            getOptionKey={(option) => option.id}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            multiple
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
            isOptionEqualToValue={(option, value) => option.id === value.id}
            multiple
            fullWidth
          />
          <ControlledDateRangePicker name="dateRange" label="Dates" fullWidth />
        </Stack>
        <ControlledAutoComplete
          name="initiation"
          label="Initiation"
          options={initiationList}
          getOptionLabel={(option) => option.name}
          getOptionKey={(option) => option.id}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          sx={{ width: "calc(50% - 8px)" }}
        />
      </Box>
    </>
  );
};

export default InspectionFormLeft;
