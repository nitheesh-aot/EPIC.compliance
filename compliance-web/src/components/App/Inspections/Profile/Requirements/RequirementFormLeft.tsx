import { FC, useState } from "react";
import {
  Box,
  Checkbox,
  FormControlLabel,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import ControlledAutoComplete from "@/components/Shared/Controlled/ControlledAutoComplete";
import { BCDesignTokens } from "epic.theme";
import ControlledTextField from "@/components/Shared/Controlled/ControlledTextField";
import ControlledRichTextEditor from "@/components/Shared/Controlled/ControlledRichTextEditor";
import { Topic } from "@/models/Topic";
import { EnforcementAction } from "@/models/EnforcementAction";
import { ComplianceFinding } from "@/models/ComplianceFinding";
import { InspectionRequirementType } from "@/models/InspectionRequirementType";
import { CheckRounded } from "@mui/icons-material";
import { Agency } from "@/models/Agency";

const REQUIREMENT_TYPE_ID = "REQ";

type RequirementFormLeftProps = {
  inspectionRequirementTypesList: InspectionRequirementType[];
  enforcementActionsList: EnforcementAction[];
  complianceFindingsList: ComplianceFinding[];
  topicList: Topic[];
  agencyList: Agency[];
  appHeaderHeight: number;
};

const RequirementFormLeft: FC<RequirementFormLeftProps> = ({
  inspectionRequirementTypesList,
  enforcementActionsList,
  complianceFindingsList,
  topicList,
  agencyList,
  appHeaderHeight,
}) => {
  const [selectedRequirementType, setSelectedRequirementType] =
    useState<InspectionRequirementType>(
      inspectionRequirementTypesList[0]
    );
  const [isReferredToAnotherAgency, setIsReferredToAnotherAgency] =
    useState<boolean>(false);

  const handleRequirementType = (
    _event: React.MouseEvent<HTMLElement>,
    newSelectedRequirementType: InspectionRequirementType
  ) => {
    setSelectedRequirementType(newSelectedRequirementType);
  };

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
        <ToggleButtonGroup
          value={selectedRequirementType}
          exclusive
          onChange={handleRequirementType}
          aria-label="requirement type"
          sx={{
            marginBottom: "1rem",
            height: "2.5rem",
            backgroundColor: BCDesignTokens.surfaceColorBackgroundWhite,
          }}
        >
          {inspectionRequirementTypesList.map((requirementType) => (
            <ToggleButton
              key={requirementType.id}
              value={requirementType}
              aria-label={requirementType.name}
              selected={requirementType === selectedRequirementType}
              sx={{
                border: `1px solid ${BCDesignTokens.surfaceColorBorderDefault}`,
                paddingX: "1rem",
                "&.Mui-selected": {
                  border: `1px solid ${BCDesignTokens.surfaceColorBorderDark}`,
                },
              }}
            >
              {requirementType.name}
              {requirementType === selectedRequirementType && (
                <CheckRounded sx={{ marginLeft: "0.5rem" }} fontSize="small" />
              )}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
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
          isOptionEqualToValue={(option, value) =>
            option.id.toString() === value.id.toString()
          }
          fullWidth
        />
        {selectedRequirementType?.id !== REQUIREMENT_TYPE_ID && (
          <FormControlLabel
            control={
              <Checkbox
                checked={isReferredToAnotherAgency}
                onChange={(event) =>
                  setIsReferredToAnotherAgency(event.target.checked)
                }
                sx={{
                  paddingY: 0,
                }}
              />
            }
            label="Mark if issue was referred to another Agency"
            sx={{
              marginBottom: "1rem",
            }}
          />
        )}
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
