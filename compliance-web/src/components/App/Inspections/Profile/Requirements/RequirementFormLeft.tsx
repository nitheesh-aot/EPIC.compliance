import { FC, useEffect, useCallback, memo } from "react";
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
import { useFormContext, useWatch } from "react-hook-form";
import {
  ComplianceFindingEnum,
  EnforcementActionEnum,
  REGULATORY_CONSIDERATION_TYPE_ID,
  REQUIREMENT_TYPE_ID,
} from "./RequirementUtils";
import ControlledToggleButtonGroup from "@/components/Shared/Controlled/ControlledToggleButtonGroup";

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
};

const useRequirementForm = (enforcementActionsList: EnforcementAction[]) => {
  const { control, setValue } = useFormContext();

  const formValues = useWatch({
    control,
    name: [
      "isReferredToAnotherAgency",
      "requirementType",
      "enforcementAction",
      "complianceFinding",
    ],
  });

  const [
    isReferredToAnotherAgency,
    selectedRequirementType,
    enforcementAction,
    complianceFinding,
  ] = formValues;

  useEffect(() => {
    if (complianceFinding?.id === ComplianceFindingEnum.IN) {
      const notApplicable = enforcementActionsList.find(
        (action) => action.id === EnforcementActionEnum.NOT_APPLICABLE
      );
      if (notApplicable) {
        setValue("enforcementAction", notApplicable);
      }
    }
  }, [complianceFinding, enforcementActionsList, setValue]);

  return {
    isReferredToAnotherAgency,
    selectedRequirementType,
    enforcementAction,
    complianceFinding,
  };
};

const RequirementTypeSection = memo(
  ({
    inspectionRequirementTypesList,
    isRegulatoryConsiderationExists,
  }: {
    inspectionRequirementTypesList: InspectionRequirementType[];
    isRegulatoryConsiderationExists?: boolean;
  }) => (
    <ControlledToggleButtonGroup
      name="requirementType"
      options={inspectionRequirementTypesList}
      aria-label="requirement type"
      disabled={isRegulatoryConsiderationExists}
    />
  )
);

const ComplianceSection = memo(
  ({
    complianceFindingsList,
    enforcementActionsList,
  }: {
    complianceFindingsList: ComplianceFinding[];
    enforcementActionsList: EnforcementAction[];
  }) => {
    const { enforcementAction } = useRequirementForm(enforcementActionsList);

    return (
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
    );
  }
);

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
  }) => {
    const {
      isReferredToAnotherAgency,
      selectedRequirementType,
      enforcementAction,
    } = useRequirementForm(enforcementActionsList);

    const handleRequirementTypeChange = useCallback(
      (requirementType: InspectionRequirementType | null) => {
        onRequirementTypeChange?.(requirementType);
      },
      [onRequirementTypeChange]
    );

    useEffect(() => {
      handleRequirementTypeChange(selectedRequirementType);
    }, [selectedRequirementType, handleRequirementTypeChange]);

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
        <RequirementTypeSection
          inspectionRequirementTypesList={inspectionRequirementTypesList}
          isRegulatoryConsiderationExists={isRegulatoryConsiderationExists}
        />
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
          <ComplianceSection
            complianceFindingsList={complianceFindingsList}
            enforcementActionsList={enforcementActionsList}
          />
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
        <ControlledRichTextEditor
          label="Findings"
          name="findings"
          height={`calc(100vh - ${appHeaderHeight + 456}px)`}
          marginBottom="0"
        />
      </Box>
    );
  }
);

export default RequirementFormLeft;
