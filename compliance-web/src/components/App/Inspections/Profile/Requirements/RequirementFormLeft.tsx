import { FC, useEffect, useState, useRef, useCallback } from "react";
import { Alert, Box, Grid, IconButton, Stack } from "@mui/material";
import ControlledAutoComplete from "@/components/Shared/Controlled/ControlledAutoComplete";
import { BCDesignTokens } from "epic.theme";
import ControlledTextField from "@/components/Shared/Controlled/ControlledTextField";
import { Topic } from "@/models/Topic";
import { EnforcementAction } from "@/models/EnforcementAction";
import { ComplianceFinding } from "@/models/ComplianceFinding";
import { Agency } from "@/models/Agency";
import ControlledCheckbox from "@/components/Shared/Controlled/ControlledCheckbox";
import { useFormContext, useWatch } from "react-hook-form";
import {
  ComplianceFindingEnum,
  formatImagesToMentionList,
} from "./RequirementUtils";
import { EditOutlined } from "@mui/icons-material";
import GridLabelValuePair from "@/components/Shared/GridLabelValuePair";
import ControlledLexicalEditor from "@/components/Shared/Controlled/ControlledLexicalEditor";
import { useRequirementStore } from "./requirementStore";
import { MentionData } from "@/components/Shared/LexicalEditor/LexicalUtils";
import {
  EnforcementActionEnum,
  OrderProgressEnum,
  WarningLetterProgressEnum,
} from "@/utils/constants";
import { useInspectionOrdersData } from "@/hooks/useInspectionOrders";
import { useInspectionWarningLettersData } from "@/hooks/useInspectionWarningLetters";
import { useModal } from "@/store/modalStore";
import ConfirmationModal from "@/components/Shared/Popups/ConfirmationModal";

type RequirementFormLeftProps = {
  enforcementActionsList: EnforcementAction[];
  complianceFindingsList: ComplianceFinding[];
  topicList: Topic[];
  agencyList: Agency[];
  appHeaderHeight: number;
  isEditMode?: boolean;
  isRegulatoryConsideration?: boolean;
  requirementId: number;
  inspectionId: number;
  currentEnforcementAction?: EnforcementAction;
  isRequirementEditable?: boolean;
};

const RequirementFormLeft: FC<RequirementFormLeftProps> = ({
  enforcementActionsList,
  complianceFindingsList,
  topicList,
  agencyList,
  appHeaderHeight,
  isEditMode,
  isRegulatoryConsideration,
  requirementId,
  inspectionId,
  currentEnforcementAction,
  isRequirementEditable = true,
}) => {
  const { setOpen, setClose } = useModal();
  const { control, setValue, getValues } = useFormContext();
  const { requirementPhotos, requirementFigures } = useRequirementStore();
  const [mentionDataList, setMentionDataList] = useState<MentionData[]>([]);
  const [mentionVersion, setMentionVersion] = useState<number>(0);
  const [orderExists, setOrderExists] = useState<boolean>(false);
  const [warningLetterExists, setWarningLetterExists] =
    useState<boolean>(false);
  const [disableEnforcementAction, setDisableEnforcementAction] =
    useState<boolean>(false);
  const summaryInputRef = useRef<HTMLInputElement>(null);
  const [isReadOnly, setIsReadOnly] = useState(isEditMode);

  const { data: inspectionOrdersData } = useInspectionOrdersData(inspectionId, {
    isStaleInfinate: false,
  });
  const { data: inspectionWarningLettersData } =
    useInspectionWarningLettersData(inspectionId, { isStaleInfinate: false });

  const inputFocus = useCallback((inputRef: HTMLInputElement | null) => {
    if (inputRef) {
      inputRef.focus();
      const textLength = inputRef.value?.length || 0;
      inputRef.setSelectionRange(textLength, textLength);
    }
  }, []);

  useEffect(() => {
    if (!isReadOnly && summaryInputRef.current !== document.activeElement) {
      setTimeout(() => {
        inputFocus(summaryInputRef.current);
      }, 0);
    }
  }, [isReadOnly, inputFocus]);

  const updateMentionList = useCallback(() => {
    const reqId = !requirementId ? NaN : requirementId;
    const mentionList = formatImagesToMentionList([
      ...(requirementPhotos.get(reqId) ?? []),
      ...(requirementFigures.get(reqId) ?? []),
    ]);
    setMentionDataList(mentionList);
    setMentionVersion((prev) => prev + 1);
  }, [requirementPhotos, requirementFigures, requirementId]);

  useEffect(() => {
    updateMentionList();
  }, [updateMentionList]);

  const isReferredToAnotherAgency = useWatch({
    control,
    name: "isReferredToAnotherAgency",
  });

  const enforcementAction = useWatch({
    control,
    name: "enforcementAction",
  });

  const complianceFinding = useWatch({
    control,
    name: "complianceFinding",
  });

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

  useEffect(() => {
    // Check if requirement exists in inspection orders
    const requirementsInOrders =
      inspectionOrdersData?.filter((order) =>
        order.order_requirement_maps?.some(
          (map) => map.inspection_requirement_id === requirementId
        )
      ) ?? [];
    setOrderExists(requirementsInOrders.length > 0);

    // Check if requirement exists in warning letters
    const requirementsInWarningLetters =
      inspectionWarningLettersData?.filter((letter) =>
        letter.warning_letter_requirement_maps?.some(
          (map) => map.inspection_requirement_id === requirementId
        )
      ) ?? [];
    setWarningLetterExists(requirementsInWarningLetters.length > 0);

    if (
      requirementsInOrders.length > 0 ||
      requirementsInWarningLetters.length > 0
    ) {
      const nonDraftOrders = requirementsInOrders.some(
        (order) => order.order_progress?.id !== OrderProgressEnum.DRAFTING
      );
      const nonDraftWarningLetters = requirementsInWarningLetters.some(
        (letter) => letter.progress?.id !== WarningLetterProgressEnum.DRAFTING
      );
      setDisableEnforcementAction(nonDraftOrders || nonDraftWarningLetters);
    } else {
      setDisableEnforcementAction(false);
    }
  }, [inspectionOrdersData, inspectionWarningLettersData, requirementId]);

  useEffect(() => {
    // Only show confirmation modal when in edit mode and not readonly
    if (currentEnforcementAction && !isReadOnly) {
      const hasEnforcementActionChanged =
        currentEnforcementAction?.id !== enforcementAction?.id;

      if (
        [
          EnforcementActionEnum.ORDER,
          EnforcementActionEnum.WARNING_LETTER,
        ].includes(currentEnforcementAction?.id as EnforcementActionEnum) &&
        hasEnforcementActionChanged &&
        (orderExists || warningLetterExists)
      ) {
        setOpen({
          content: (
            <ConfirmationModal
              title="Change Enforcement Action?"
              description={`A document already exists for the previous enforcement action(${currentEnforcementAction?.name}). 
              Changing it will delete the existing document so you can create a new one`}
              confirmButtonText="Proceed"
              onConfirm={() => {
                setClose();
              }}
              onCancel={() => {
                setClose();
                setValue("enforcementAction", currentEnforcementAction);
              }}
            />
          ),
        });
      }
    }
  }, [
    currentEnforcementAction,
    enforcementAction,
    orderExists,
    setClose,
    setOpen,
    setValue,
    warningLetterExists,
    isReadOnly,
  ]);

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
        {isRequirementEditable && (
          <IconButton
            aria-label="edit"
            onClick={() => setIsReadOnly(false)}
            size="small"
            sx={{ marginBottom: "-1rem", marginTop: "-0.5rem" }}
            data-cy="editable-requirement-button"
          >
            <EditOutlined sx={{ fontSize: "1.25rem" }} />
          </IconButton>
        )}
        <Grid container spacing={1}>
          <GridLabelValuePair
            label="Requirement Summary"
            value={getValues("requirementSummary")}
            multiline
          />
          <GridLabelValuePair label="Topic" value={getValues("topic")?.name} />
          {!isRegulatoryConsideration && (
            <>
              <GridLabelValuePair
                label="Compliance Finding"
                value={getValues("complianceFinding")?.name}
                gridProps={{ xs: 4 }}
              />
              <GridLabelValuePair
                label="Enforcement Action"
                value={`${getValues("enforcementAction")?.name ?? ""}${
                  getValues("isReferralToAdministrativePenalty")
                    ? ", Referral to Administrative Penalty"
                    : ""
                }`}
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
    useEffect(() => {
      if (
        document.activeElement === null ||
        document.activeElement === document.body
      ) {
        inputFocus(summaryInputRef.current);
      }
    }, []);

    return (
      <>
        <ControlledTextField
          name="requirementSummary"
          label={isRegulatoryConsideration ? "Summary" : "Requirement Summary"}
          placeholder="e.g installing and maintaining erosion and sediment control measures"
          fullWidth
          inputRef={summaryInputRef}
          inputProps={{ "data-cy": "requirement-summary-input" }}
          multiline
          isRequired={true}
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
          isRequired={true}
        />
        {isRegulatoryConsideration && (
          <ControlledCheckbox
            name="isReferredToAnotherAgency"
            label="Mark if issue was referred to another Agency"
          />
        )}
        {!isRegulatoryConsideration && (
          <>
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
                isRequired={true}
                disabled={disableEnforcementAction}
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
                  isRequired={true}
                  disabled={disableEnforcementAction}
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
            {disableEnforcementAction && (
              <Alert
                severity="warning"
                sx={{ fontSize: "0.75rem", mb: 1, mt: -0.5 }}
              >
                An enforcement document has already been inprogress or issued.
                The Enforcement Action can no longer be changed.
              </Alert>
            )}
          </>
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
        padding: "0.5rem 1rem 1rem 2rem",
        width: "718px",
        overflow: "auto",
        boxSizing: "border-box",
      }}
    >
      {isReadOnly ? <ReadOnlySection /> : <EditSection />}
      <ControlledLexicalEditor
        label="Findings"
        name="findings"
        placeholder="Enter Findings..."
        height={`calc(100vh - ${appHeaderHeight + 363}px)`}
        isAdvanced
        mentionsList={mentionDataList}
        key={`lexical-editor-${mentionVersion}`}
        disabled={!isRequirementEditable}
      />
    </Box>
  );
};

export default RequirementFormLeft;
