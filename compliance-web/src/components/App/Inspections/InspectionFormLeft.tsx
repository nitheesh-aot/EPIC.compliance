import { FC, useEffect, useState } from "react";
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
import { UNAPPROVED_PROJECT_ID } from "@/utils/constants";
import { useDrawer } from "@/store/drawerStore";

type InspectionFormLeftProps = {
  projectList: Project[];
  initiationList: Initiation[];
  staffUsersList: StaffUser[];
  irTypeList: IRType[];
};

const InspectionFormLeft: FC<InspectionFormLeftProps> = ({
  projectList,
  initiationList,
  staffUsersList,
  irTypeList,
}) => {
  const { isOpen } = useDrawer();
  const { setValue, resetField } = useFormContext();
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null
  );
  const [isUnapprovedProject, setIsUnapprovedProject] =
    useState<boolean>(false);

  const { data: projectData } = useProjectById(selectedProjectId!);

  useEffect(() => {
    if (selectedProjectId && projectData) {
      setValue("isProjectDetailsDisabled", true);
      setValue("authorization", projectData?.ea_certificate ?? "");
      setValue("certificateHolder", projectData?.proponent?.name ?? "");
      setValue("projectDescription", projectData?.description ?? "");
      setValue("projectType", projectData?.type?.name ?? "");
      setValue("projectSubType", projectData?.sub_type?.name ?? "");
    } else {
      resetField("isProjectDetailsDisabled");
      resetField("authorization");
      resetField("certificateHolder");
      resetField("projectDescription");
    }
    if (isUnapprovedProject) {
      setValue("isProjectDetailsDisabled", false);
      resetField("projectType");
      resetField("projectSubType");
    }
  }, [
    isUnapprovedProject,
    projectData,
    resetField,
    selectedProjectId,
    setValue,
  ]);

  // Resetting states when the drawer closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedProjectId(null);
      setIsUnapprovedProject(false);
    }
  }, [isOpen]);

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
              const projId = (value as Project)?.id;
              if (projId === UNAPPROVED_PROJECT_ID) {
                setIsUnapprovedProject(true);
                setSelectedProjectId(null);
              } else {
                setSelectedProjectId(projId);
              }
            }}
          />
          <ControlledTextField
            name="authorization"
            label="Authorization"
            placeholder="Authorization"
            disabled={!!selectedProjectId}
            sx={{ width: "70%" }}
          />
          <ControlledTextField
            name="certificateHolder"
            label="Certificate Holder"
            placeholder="Certificate Holder"
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
        <Stack direction={"row"} gap={2}>
          <ControlledTextField
            name="projectType"
            label="Project Type"
            placeholder="Project Type"
            disabled={!!selectedProjectId}
            fullWidth
          />
          <ControlledTextField
            name="projectSubType"
            label="Project Subtype"
            placeholder="Project Subtype"
            disabled={!!selectedProjectId}
            fullWidth
          />
        </Stack>
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
