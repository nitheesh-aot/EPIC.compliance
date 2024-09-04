import { Box, Stack } from "@mui/material";
import ControlledAutoComplete from "@/components/Shared/Controlled/ControlledAutoComplete";
import { IRStatus } from "@/models/IRStatus";
import { ProjectStatus } from "@/models/ProjectStatus";
import { FC } from "react";
import ComingSoon from "@/components/Shared/ComingSoon";

type InspectionFormRightProps = {
  irStatusList: IRStatus[];
  projectStatusList: ProjectStatus[];
};

const InspectionFormRight: FC<InspectionFormRightProps> = ({
  irStatusList,
  projectStatusList,
}) => {
  return (
    <>
      <Box
        sx={{
          padding: "1rem 2rem 1rem 1rem",
          width: "399px",
          boxSizing: "border-box",
          overflow: "auto",
        }}
      >
        <Stack>
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
          <ComingSoon />
        </Stack>
      </Box>
    </>
  );
};

export default InspectionFormRight;
