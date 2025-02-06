import { FC, useEffect, useCallback, memo, useState } from "react";
import { Box, Grid, IconButton, Stack } from "@mui/material";
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
import { useFormContext, useWatch } from "react-hook-form";
import {
  ComplianceFindingEnum,
  EnforcementActionEnum,
  REGULATORY_CONSIDERATION_TYPE_ID,
  REQUIREMENT_TYPE_ID,
} from "./RequirementUtils";
import ControlledToggleButtonGroup from "@/components/Shared/Controlled/ControlledToggleButtonGroup";
import { EditOutlined } from "@mui/icons-material";
import GridLabelValuePair from "./GridLabelValuePair";

type RequirementFormLeftProps = {
  inspectionRequirementTypesList: InspectionRequirementType[];
  enforcementActionsList: EnforcementAction[];
  complianceFindingsList: ComplianceFinding[];
  topicList: Topic[];
  agencyList: Agency[];
  appHeaderHeight: number;
  onRequirementTypeChange?: (
    requirementType: InspectionRequirementType | null
  ) => void;
  isRegulatoryConsiderationExists?: boolean;
  isEditMode?: boolean;
};

const RequirementFormLeft: FC<RequirementFormLeftProps> = memo(
  ({
    inspectionRequirementTypesList,
    enforcementActionsList,
    complianceFindingsList,
    topicList,
    agencyList,
    appHeaderHeight,
    onRequirementTypeChange,
    isRegulatoryConsiderationExists,
    isEditMode,
  }) => {
    const { control, setValue, getValues } = useFormContext();

    const isReferredToAnotherAgency = useWatch({
      control,
      name: "isReferredToAnotherAgency",
    });

    const selectedRequirementType = useWatch({
      control,
      name: "requirementType",
    });

    const enforcementAction = useWatch({
      control,
      name: "enforcementAction",
    });

    const complianceFinding = useWatch({
      control,
      name: "complianceFinding",
    });

    const handleRequirementTypeChange = useCallback(
      (requirementType: InspectionRequirementType | null) => {
        onRequirementTypeChange?.(requirementType);
      },
      [onRequirementTypeChange]
    );

    const [isReadOnly, setIsReadOnly] = useState(isEditMode);

    useEffect(() => {
      handleRequirementTypeChange(selectedRequirementType);
    }, [selectedRequirementType, handleRequirementTypeChange]);

    useEffect(() => {
      if (
        complianceFinding?.id === ComplianceFindingEnum.IN &&
        !getValues("enforcementAction")?.id
      ) {
        const notApplicableAction = enforcementActionsList.find(
          (action) => action.id === EnforcementActionEnum.NOT_APPLICABLE
        );
        setValue("enforcementAction", notApplicableAction);
      }
    }, [complianceFinding, enforcementActionsList, setValue, getValues]);

    const ReadOnlySection = () => {
      const { getValues } = useFormContext();
      const agencyName = getValues("agency")?.name;
      return (
        <Box
          sx={{
            borderRadius: "4px",
            border: `1px solid ${BCDesignTokens.surfaceColorBorderDefault}`,
            background: BCDesignTokens.surfaceColorBackgroundWhite,
            display: "flex",
            padding: "1rem",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "0.5rem",
            alignSelf: "stretch",
            mb: "1.5rem",
          }}
        >
          <IconButton
            aria-label="edit"
            onClick={() => setIsReadOnly(false)}
            size="small"
            sx={{ marginBottom: "-1rem", marginTop: "-0.5rem" }}
          >
            <EditOutlined sx={{ fontSize: "1.25rem" }} />
          </IconButton>
          <Grid container spacing={1}>
            <GridLabelValuePair
              label="Requirement Summary"
              value={getValues("requirementSummary")}
              gridProps={{ xs: 4 }}
            />
            <GridLabelValuePair
              label="Topic"
              value={getValues("topic")?.name}
              gridProps={{ xs: 8 }}
            />
            {selectedRequirementType?.id === REQUIREMENT_TYPE_ID && (
              <>
                <GridLabelValuePair
                  label="Compliance Finding"
                  value={getValues("complianceFinding")?.name}
                  gridProps={{ xs: 4 }}
                />
                <GridLabelValuePair
                  label="Enforcement Action"
                  value={getValues("enforcementAction")?.name}
                  gridProps={{ xs: agencyName ? 4 : 8 }}
                />
              </>
            )}
            {agencyName && (
              <GridLabelValuePair
                label="Agency"
                value={agencyName}
                gridProps={{ xs: 4 }}
              />
            )}
          </Grid>
        </Box>
      );
    };

    const EditSection = () => {
      return (
        <>
          {!isEditMode && (
            <ControlledToggleButtonGroup
              name="requirementType"
              options={inspectionRequirementTypesList}
              aria-label="requirement type"
              disabled={isRegulatoryConsiderationExists}
            />
          )}
          <ControlledTextField
            name="requirementSummary"
            label={
              selectedRequirementType?.id === REQUIREMENT_TYPE_ID
                ? "Requirement Summary"
                : "Summary"
            }
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
          {selectedRequirementType?.id === REGULATORY_CONSIDERATION_TYPE_ID && (
            <ControlledCheckbox
              name="isReferredToAnotherAgency"
              label="Mark if issue was referred to another Agency"
            />
          )}
          {selectedRequirementType?.id === REQUIREMENT_TYPE_ID && (
            <Stack direction="row" gap={2}>
              <ControlledAutoComplete
                sx={{ width: "50%" }}
                name="complianceFinding"
                label="Compliance Finding"
                options={complianceFindingsList}
                getOptionLabel={(option) => option.name}
                getOptionKey={(option) => option.id}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                fullWidth
              />
              <Stack direction="column" sx={{ width: "50%" }}>
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
                  sx={{ marginBottom: "-0.5rem" }}
                />
                {enforcementAction?.id === EnforcementActionEnum.ORDER && (
                  <ControlledCheckbox
                    name="isReferralToAdministrativePenalty"
                    label="Add Referral to Administrative Penalty"
                    fontSize="small"
                  />
                )}
              </Stack>
            </Stack>
          )}
          {(isReferredToAnotherAgency ||
            enforcementAction?.id ===
              EnforcementActionEnum.REFER_TO_ANOTHER_AGENCY) && (
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
      );
    };

    return (
      <Box
        sx={{
          background: BCDesignTokens.surfaceColorBackgroundLightGray,
          padding: "1rem 1rem 1rem 2rem",
          width: "718px",
          overflow: "auto",
          boxSizing: "border-box",
        }}
      >
        {isReadOnly ? <ReadOnlySection /> : <EditSection />}
        <ControlledRichTextEditor
          label="Findings"
          name="findings"
          height={`calc(100vh - ${appHeaderHeight + 363}px)`}
          marginBottom="0"
        />
      </Box>
    );
  }
);

export default RequirementFormLeft;
