import React, { useEffect, useState } from "react";
import { Box, Stack } from "@mui/material";
import { StaffUser } from "@/models/Staff";
import ControlledAutoComplete from "@/components/Shared/Controlled/ControlledAutoComplete";
import { BCDesignTokens } from "epic.theme";
import { Project } from "@/models/Project";
import { Initiation } from "@/models/Initiation";
import ControlledTextField from "@/components/Shared/Controlled/ControlledTextField";
import { IRType } from "@/models/IRType";
import ControlledDateRangePicker from "@/components/Shared/Controlled/ControlledDateRangePicker";
import { useProjectById } from "@/hooks/useProjects";
import { useFormContext } from "react-hook-form";

type InspectionFormLeftProps = {
  projectList: Project[];
  initiationList: Initiation[];
  staffUsersList: StaffUser[];
  irTypeList: IRType[];
};

const InspectionFormLeft: React.FC<InspectionFormLeftProps> = ({
  projectList,
  initiationList,
  staffUsersList,
  irTypeList,
}) => {
  const { setValue } = useFormContext();
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null
  );

  const { data: projectData } = useProjectById(selectedProjectId!);

  useEffect(() => {
    if (selectedProjectId) {
      // eslint-disable-next-line no-console
      console.log(projectData);
      setValue("authorization", projectData?.ea_certificate ?? "");
      setValue("certificateHolder", projectData?.proponent?.name ?? "");
      setValue("projectDescription", projectData?.description ?? "");
      setValue("isProjectDetailsDisabled", true);
    }
  }, [projectData, selectedProjectId, setValue]);

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
        <Stack direction={"row"} gap={2}>
          <ControlledAutoComplete
            name="project"
            label="Project"
            options={projectList}
            getOptionLabel={(option) => option.name}
            getOptionKey={(option) => option.id}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            fullWidth
            onChange={(_, value) => {
              setSelectedProjectId(value ? (value as Project).id : null);
            }}
          />
          <ControlledTextField
            name="authorization"
            label="Authorization"
            disabled={!!selectedProjectId}
            sx={{ width: "70%" }}
          />
          <ControlledTextField
            name="certificateHolder"
            label="Certificate Holder"
            disabled={!!selectedProjectId}
            fullWidth
          />
        </Stack>
        <ControlledTextField
          name="projectDescription"
          label="Project Description"
          multiline
          disabled={!!selectedProjectId}
          fullWidth
          minRows={2}
        />
        <ControlledTextField
          name="locationDescription"
          label="Location Description (optional)"
          multiline
          fullWidth
          minRows={2}
        />
        <ControlledTextField name="utm" label="UTM (optional)" fullWidth />
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
            name="irType"
            label="Type"
            options={irTypeList}
            getOptionLabel={(option) => option.name}
            getOptionKey={(option) => option.id}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            multiple
            fullWidth
          />
          <ControlledDateRangePicker label="Dates" name="dateRange" fullWidth />
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
