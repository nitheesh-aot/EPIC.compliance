import { FC } from "react";
import { Box, Stack } from "@mui/material";
import { StaffUser } from "@/models/Staff";
import ControlledAutoComplete from "@/components/Shared/Controlled/ControlledAutoComplete";
import { BCDesignTokens } from "epic.theme";
import { Project } from "@/models/Project";
import ControlledTextField from "@/components/Shared/Controlled/ControlledTextField";
import ProjectDetailsForm from "@/components/App/ProjectDetailsForm";
import ControlledDateField from "@/components/Shared/Controlled/ControlledDateField";

type ComplaintFormLeftProps = {
  projectList: Project[];
  staffUsersList: StaffUser[];
};

const ComplaintFormLeft: FC<ComplaintFormLeftProps> = ({
  projectList,
  staffUsersList,
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
        <ProjectDetailsForm projectList={projectList} />
        <ControlledTextField
          name="concernDescription"
          label="Concern Description"
          placeholder="Specify concern"
          multiline
          fullWidth
          minRows={2}
        />
        <ControlledTextField
          name="locationDescription"
          label="Location Description (optional)"
          placeholder="Specify inspected location"
          multiline
          fullWidth
          minRows={2}
        />
        <Stack direction={"row"} gap={2}>
          <ControlledAutoComplete
            name="leadOfficer"
            label="Lead Officer (optional)"
            options={staffUsersList}
            getOptionLabel={(option) => option.full_name ?? ""}
            getOptionKey={(option) => option.id}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            fullWidth
          />
          <ControlledDateField
            name="dateReceived"
            label="Date Received"
            sx={{ width: "100%" }}
          />
        </Stack>
      </Box>
    </>
  );
};

export default ComplaintFormLeft;
