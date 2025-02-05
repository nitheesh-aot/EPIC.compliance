import { useUpdateInspectionRequirementOrder } from "@/hooks/useInspectionRequirements";
import { InspectionRequirement } from "@/models/InspectionRequirement";
import { notify } from "@/store/snackbarStore";
import { DragIndicatorRounded } from "@mui/icons-material";
import { Box, Grid, Typography } from "@mui/material";
import { BCDesignTokens } from "epic.theme";
import { Reorder } from "framer-motion";
import React, { memo, useCallback, useState } from "react";
import {
  isRequirementSourceCondition,
  REGULATORY_CONSIDERATION_TYPE_ID,
} from "./RequirementUtils";

interface RequirementCardProps {
  requirement: InspectionRequirement;
  index: number;
  onEdit: () => void;
  isActive: boolean;
}

const LabelValuePair: React.FC<{
  label: string;
  value: React.ReactNode;
  gridProps?: { xs: number };
}> = React.memo(({ label, value, gridProps = { xs: 12 } }) => (
  <Grid item {...gridProps}>
    <Typography
      variant="body2"
      color={BCDesignTokens.typographyColorPlaceholder}
    >
      {label}
    </Typography>
    <Typography variant="body1">{value}</Typography>
  </Grid>
));

const cardStyles = {
  card: {
    backgroundColor: BCDesignTokens.surfaceColorBackgroundWhite,
    mb: 2,
    border: `1px solid ${BCDesignTokens.surfaceColorBorderDefault}`,
    borderRadius: BCDesignTokens.layoutBorderRadiusMedium,
    "&:hover": {
      cursor: "pointer",
      boxShadow: `0px 4px 6px 0px ${BCDesignTokens.surfaceColorBorderDefault}`,
    },
  },
  header: {
    display: "flex",
    alignItems: "center",
    p: "0.75rem 1.5rem",
    pl: 0,
    backgroundColor: BCDesignTokens.surfaceColorBackgroundLightGray,
  },
  content: {
    p: "0.5rem 1.5rem 1rem",
  },
};

const RequirementCard: React.FC<RequirementCardProps> = memo(
  ({ requirement, index, onEdit, isActive }) => {
    const [isDragging, setIsDragging] = useState(false);

    const isRegulatoryConsideration =
      requirement.req_type?.id === REGULATORY_CONSIDERATION_TYPE_ID;

    const isCondition = isRequirementSourceCondition(
      requirement.requirement_source_details?.[0]?.requirement_source_id.toString()
    );

    const onSuccess = useCallback(() => {
      notify.success("Requirement sort order updated");
    }, []);

    const { mutate: updateInspectionRequirementOrder } =
      useUpdateInspectionRequirementOrder(onSuccess);

    const handleDragEnd = useCallback(() => {
      updateInspectionRequirementOrder({
        inspectionId: requirement.inspection_id,
        requirementId: requirement.id,
        sortOrder: index + 1,
      });
      setTimeout(() => setIsDragging(false), 100);
    }, [
      requirement.inspection_id,
      requirement.id,
      index,
      updateInspectionRequirementOrder,
    ]);

    const handleClick = useCallback(() => {
      if (!isDragging) {
        onEdit();
      }
    }, [isDragging, onEdit]);

    const renderRegulatoryContent = useCallback(
      () => (
        <>
          <LabelValuePair label="Summary" value={requirement.summary} />
          <LabelValuePair
            label="Topic"
            value={requirement.topic.name}
            gridProps={{ xs: 4 }}
          />
          <LabelValuePair
            label="Agency"
            value={requirement.agency?.name ?? ""}
            gridProps={{ xs: 8 }}
          />
        </>
      ),
      [requirement]
    );

    const renderRequirementContent = useCallback(
      () => (
        <>
          <LabelValuePair label="Topic" value={requirement.topic.name} />
          <LabelValuePair
            label="Source"
            value={
              requirement.requirement_source_details?.[0]?.requirement_source
                ?.name
            }
            gridProps={{ xs: 4 }}
          />
          <LabelValuePair
            label={isCondition ? "Condition #" : "Section #"}
            value={
              isCondition
                ? requirement.requirement_source_details?.[0]?.condition_number
                : requirement.requirement_source_details?.[0]?.section_number
            }
            gridProps={{ xs: 8 }}
          />
          <LabelValuePair
            label="Compliance Finding"
            value={requirement.compliance_finding?.name}
            gridProps={{ xs: 4 }}
          />
          <LabelValuePair
            label="Enforcement Action"
            value={requirement.enforcement_action_data
              .map((action) => action.name)
              .join(", ")}
            gridProps={{ xs: 8 }}
          />
        </>
      ),
      [isCondition, requirement]
    );

    const renderCardContent = useCallback(() => {
      return (
        <Box
          sx={{
            ...cardStyles.card,
            ...(isActive && {
              borderColor: BCDesignTokens.surfaceColorBorderActive,
            }),
          }}
          onClick={handleClick}
        >
          <Box sx={cardStyles.header}>
            <DragIndicatorRounded
              sx={{
                mx: 0.5,
                mb: 0.25,
                fontSize: "1.125rem",
                visibility: isRegulatoryConsideration ? "hidden" : "visible",
              }}
              color="action"
            />
            <Typography variant="body1">
              {isRegulatoryConsideration
                ? "Regulatory Consideration"
                : `#${index + 1}. ${requirement.summary}`}
            </Typography>
          </Box>
          <Box sx={cardStyles.content}>
            <Grid container spacing={0.5}>
              {isRegulatoryConsideration
                ? renderRegulatoryContent()
                : renderRequirementContent()}
            </Grid>
          </Box>
        </Box>
      );
    }, [
      handleClick,
      index,
      isActive,
      isRegulatoryConsideration,
      renderRegulatoryContent,
      renderRequirementContent,
      requirement,
    ]);

    return isRegulatoryConsideration ? (
      renderCardContent()
    ) : (
      <Reorder.Item
        key={requirement.id}
        value={requirement}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
      >
        {renderCardContent()}
      </Reorder.Item>
    );
  }
);

export default RequirementCard;
