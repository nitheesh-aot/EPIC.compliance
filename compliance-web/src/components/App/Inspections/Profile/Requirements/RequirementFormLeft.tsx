import { FC, useEffect } from "react";
import { Box, Stack } from "@mui/material";
import ControlledAutoComplete from "@/components/Shared/Controlled/ControlledAutoComplete";
import { BCDesignTokens } from "epic.theme";
import ControlledTextField from "@/components/Shared/Controlled/ControlledTextField";
import ControlledRichTextEditor from "@/components/Shared/Controlled/ControlledRichTextEditor";
import { Topic } from "@/models/Topic";
import { EnforcementAction } from "@/models/EnforcementAction";
import { ComplianceFinding } from "@/models/ComplianceFinding";
import { InspectionRequirementType } from "@/models/InspectionRequirementType";
import { Agency } from "@/models/Agency";
import ControlledCheckbox from "@/components/Shared/Controlled/ControlledCheckbox";
import { useFormContext } from "react-hook-form";
import { useWatch } from "react-hook-form";
import ControlledToggleButtonGroup from "@/components/Shared/Controlled/ControlledToggleButtonGroup";
import { REQUIREMENT_TYPE_ID } from "./RequirementUtils";

type RequirementFormLeftProps = {
  inspectionRequirementTypesList: InspectionRequirementType[];
  enforcementActionsList: EnforcementAction[];
  complianceFindingsList: ComplianceFinding[];
  topicList: Topic[];
  agencyList: Agency[];
  appHeaderHeight: number;
  onRequirementTypeChange?: (requirementType: InspectionRequirementType | null) => void;
};

const RequirementFormLeft: FC<RequirementFormLeftProps> = ({
  inspectionRequirementTypesList,
  enforcementActionsList,
  complianceFindingsList,
  topicList,
  agencyList,
  appHeaderHeight,
  onRequirementTypeChange,
}) => {
  const { control } = useFormContext();
  const isReferredToAnotherAgency = useWatch({
    control,
    name: "isReferredToAnotherAgency",
    defaultValue: false,
  });

  const selectedRequirementType = useWatch({
    control,
    name: "requirementType",
  });

  useEffect(() => {
    onRequirementTypeChange?.(selectedRequirementType);
  }, [selectedRequirementType, onRequirementTypeChange]);

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
        <ControlledToggleButtonGroup
          name="requirementType"
          options={inspectionRequirementTypesList}
          aria-label="requirement type"
        />
        <ControlledTextField
          name="requirementSummary"
          label={selectedRequirementType?.id === REQUIREMENT_TYPE_ID ? "Requirement Summary" : "Summary"}
          placeholder=""
          fullWidth
        />
        <ControlledAutoComplete
          name="topic"
          label="Topic"
          options={topicList}
          getOptionLabel={(option) => option.name}
          getOptionKey={(option) => option.id}
          isOptionEqualToValue={(option, value) =>
            option.id.toString() === value.id.toString()
          }
          fullWidth
        />
        {selectedRequirementType?.id !== REQUIREMENT_TYPE_ID && (
          <>
            <ControlledCheckbox
              name="isReferredToAnotherAgency"
              label="Mark if issue was referred to another Agency"
            />
            {isReferredToAnotherAgency && (
              <ControlledAutoComplete
                name="agency"
                label="Agency"
                options={agencyList}
                getOptionLabel={(option) => option.name}
                getOptionKey={(option) => option.id}
                isOptionEqualToValue={(option, value) =>
                  option.id.toString() === value.id.toString()
                }
                fullWidth
              />
            )}
          </>
        )}
        {selectedRequirementType?.id === REQUIREMENT_TYPE_ID && (
          <Stack direction={"row"} gap={2}>
            <ControlledAutoComplete
              name="complianceFinding"
              label="Compliance Finding"
              options={complianceFindingsList}
              getOptionLabel={(option) => option.name}
              getOptionKey={(option) => option.id}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              fullWidth
            />
            <ControlledAutoComplete
              name="enforcementAction"
              label="Enforcement Action"
              options={enforcementActionsList}
              getOptionLabel={(option) => option.name}
              getOptionKey={(option) => option.id}
              isOptionEqualToValue={(option, value) =>
                option.id.toString() === value.id.toString()
              }
              fullWidth
              multiple
            />
          </Stack>
        )}
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
