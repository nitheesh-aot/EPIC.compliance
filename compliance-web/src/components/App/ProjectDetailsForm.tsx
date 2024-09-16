import { Project } from "@/models/Project";
import { UNAPPROVED_PROJECT_ID } from "@/utils/constants";
import { Stack } from "@mui/material";
import { FC, useEffect, useState } from "react";
import { useProjectById } from "@/hooks/useProjects";
import { useDrawer } from "@/store/drawerStore";
import { useFormContext } from "react-hook-form";
import ControlledAutoComplete from "@/components/Shared/Controlled/ControlledAutoComplete";
import ControlledTextField from "@/components/Shared/Controlled/ControlledTextField";

type ProjectDetailsFormProps = {
  projectList: Project[];
};

const ProjectDetailsForm: FC<ProjectDetailsFormProps> = ({ projectList }) => {
  const { isOpen } = useDrawer();
  const { setValue, resetField } = useFormContext();
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null
  );

  const { data: projectData } = useProjectById(selectedProjectId!);

  useEffect(() => {
    if (selectedProjectId && projectData) {
      const eaCertifcate = projectData?.ea_certificate;
      let authorization = "n/a";
      if (eaCertifcate) {
        authorization =
          eaCertifcate[0].toLowerCase() === "x"
            ? "Exemption Order"
            : `EAC# ${eaCertifcate}`;
      }
      setValue("authorization", authorization);
      setValue("certificateHolder", projectData?.proponent?.name ?? "");
      setValue("projectDescription", projectData?.description ?? "");
      setValue("projectType", projectData?.type?.name ?? "");
      setValue("projectSubType", projectData?.sub_type?.name ?? "");
    } else {
      resetField("authorization");
      resetField("certificateHolder");
      resetField("projectDescription");
      resetField("projectType");
      resetField("projectSubType");
    }
  }, [projectData, resetField, selectedProjectId, setValue]);

  // Resetting states when the drawer closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedProjectId(null);
    }
  }, [isOpen]);

  return (
    <>
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
    </>
  );
};

export default ProjectDetailsForm;
