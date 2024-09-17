import { Box, Stack } from "@mui/material";
import ControlledAutoComplete from "@/components/Shared/Controlled/ControlledAutoComplete";
import { FC } from "react";
import { ComplaintSource } from "@/models/ComplaintSource";
import { RequirementSource } from "@/models/RequirementSource";

type ComplaintFormRightProps = {
  complaintSourceList: ComplaintSource[];
  requirementSourceList: RequirementSource[];
};

const sectionPadding = "1rem 2rem 0rem 1rem";

const ComplaintFormRight: FC<ComplaintFormRightProps> = ({
  complaintSourceList,
  requirementSourceList,
}) => {
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
              fullWidth
            />
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
