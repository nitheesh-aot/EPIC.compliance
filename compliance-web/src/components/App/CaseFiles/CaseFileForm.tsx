import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import { StaffUser } from "@/models/Staff";
import ControlledAutoComplete from "@/components/Shared/Controlled/ControlledAutoComplete";
import { BCDesignTokens } from "epic.theme";
import { Project } from "@/models/Project";
import { Initiation } from "@/models/Initiation";
import ControlledTextField from "@/components/Shared/Controlled/ControlledTextField";
import ControlledDateField from "@/components/Shared/Controlled/ControlledDateField";

type CaseFileFormProps = {
  projectList: Project[];
  initiationList: Initiation[];
  staffUsersList: StaffUser[];
  isEditMode: boolean;
};

const CaseFileForm: React.FC<CaseFileFormProps> = ({
  projectList,
  initiationList,
  staffUsersList,
  isEditMode,
}) => {
  return (
    <>
      <Box padding={"0.75rem 2rem"}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: BCDesignTokens.typographyFontWeightsBold,
            color: BCDesignTokens.typographyColorPrimary,
            marginBottom: BCDesignTokens.layoutMarginMedium,
          }}
        >
          General Information
        </Typography>
        <Stack direction={"row"} gap={2}>
          <ControlledAutoComplete
            name="project"
            label="Project"
            options={projectList}
            getOptionLabel={(option) => option.name}
            getOptionKey={(option) => option.id}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            fullWidth
            disabled={isEditMode}
          />
          <ControlledDateField
            name="dateCreated"
            label="Date Created"
            sx={{ width: "100%" }}
            disabled={isEditMode}
          />
        </Stack>
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
            name="initiation"
            label="Initiation"
            options={initiationList}
            getOptionLabel={(option) => option.name}
            getOptionKey={(option) => option.id}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            fullWidth
            disabled={isEditMode}
          />
          <ControlledTextField
            label="Case File Number"
            name="caseFileNumber"
            placeholder="Enter Case File Number"
            fullWidth
            disabled={isEditMode}
          />
        </Stack>
      </Box>
    </>
  );
};

export default CaseFileForm;
