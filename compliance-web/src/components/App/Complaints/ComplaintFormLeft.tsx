import { FC } from "react";
import { Box, Stack } from "@mui/material";
import { StaffUser } from "@/models/Staff";
import ControlledAutoComplete from "@/components/Shared/Controlled/ControlledAutoComplete";
import { BCDesignTokens } from "epic.theme";
import ControlledTextField from "@/components/Shared/Controlled/ControlledTextField";
import ControlledDateField from "@/components/Shared/Controlled/ControlledDateField";
import { Topic } from "@/models/Topic";
import RequirementSourceForm from "./RequirementSourceForm";
import { RequirementSource } from "@/models/RequirementSource";
import { InspectionOrder } from "@/models/InspectionOrder";

type ComplaintFormLeftProps = {
  staffUsersList: StaffUser[];
  topicsList: Topic[];
  requirementSourceList: RequirementSource[];
  orderList: InspectionOrder[];
};

const ComplaintFormLeft: FC<ComplaintFormLeftProps> = ({
  staffUsersList,
  topicsList,
  requirementSourceList,
  orderList,
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
        <ControlledTextField
          name="concernDescription"
          label="Concern Description"
          placeholder="Specify concern"
          multiline
          fullWidth
          minRows={2}
          isRequired={true}
        />
        <ControlledAutoComplete
          name="topic"
          label="Topic"
          options={topicsList}
          getOptionLabel={(option) => option.name}
          getOptionKey={(option) => option.id}
          isOptionEqualToValue={(option, value) =>
            option.id.toString() === value.id.toString()
          }
          fullWidth
          isRequired={true}
        />
        <ControlledTextField
          name="locationDescription"
          label="Location Description"
          placeholder="Specify inspected location"
          multiline
          fullWidth
          minRows={2}
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
            isSortOptions
            isRequired={true}
          />
          <ControlledDateField
            name="dateReceived"
            label="Date Received"
            sx={{ width: "100%" }}
            isRequired={true}
          />
        </Stack>
        <RequirementSourceForm
          requirementSourceList={requirementSourceList ?? []}
          orderList={orderList ?? []}
        />
      </Box>
    </>
  );
};

export default ComplaintFormLeft;
