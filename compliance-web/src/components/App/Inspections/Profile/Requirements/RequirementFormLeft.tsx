import { FC } from "react";
import { Box, Stack } from "@mui/material";
import ControlledAutoComplete from "@/components/Shared/Controlled/ControlledAutoComplete";
import { BCDesignTokens } from "epic.theme";
import ControlledTextField from "@/components/Shared/Controlled/ControlledTextField";
import ControlledRichTextEditor from "@/components/Shared/Controlled/ControlledRichTextEditor";
import { IRStatus } from "@/models/IRStatus";
import { IRType } from "@/models/IRType";
import { Topic } from "@/models/Topic";

type RequirementFormLeftProps = {
  irTypeList: IRType[];
  irStatusList: IRStatus[];
  topicList: Topic[];
  appHeaderHeight: number;
};

const RequirementFormLeft: FC<RequirementFormLeftProps> = ({
  irTypeList,
  irStatusList,
  topicList,
  appHeaderHeight,
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
          name="requirementSummary"
          label="Requirement Summary"
          placeholder=""
          fullWidth
        />
        <ControlledAutoComplete
          name="topic"
          label="Topic"
          options={topicList}
          getOptionLabel={(option) => option.name}
          getOptionKey={(option) => option.id}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          fullWidth
        />
        <Stack direction={"row"} gap={2}>
          <ControlledAutoComplete
            name="complianceFinding"
            label="Compliance Finding"
            options={irTypeList}
            getOptionLabel={(option) => option.name}
            getOptionKey={(option) => option.id}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            fullWidth
          />
          <ControlledAutoComplete
            name="enforcementAction"
            label="Enforcement Action"
            options={irStatusList}
            getOptionLabel={(option) => option.name}
            getOptionKey={(option) => option.id}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            fullWidth
            multiple
          />
        </Stack>
        <ControlledRichTextEditor
          label="Findings"
          name="findings"
          height={`calc(100vh - ${appHeaderHeight + 456}px)`}
          marginBottom="0"
        />
      </Box>
    </>
  );
};

export default RequirementFormLeft;
