import { useUpdateInspectionRequirementOrder } from "@/hooks/useInspectionRequirements";
import { InspectionRequirement } from "@/models/InspectionRequirement";
import { notify } from "@/store/snackbarStore";
import { DragIndicatorRounded } from "@mui/icons-material";
import { Box, Grid, Typography } from "@mui/material";
import { BCDesignTokens } from "epic.theme";
import { Reorder } from "framer-motion";
import React from "react";
import { isRequirementSourceCondition } from "./RequirementUtils";
interface RequirementCardProps {
  requirement: InspectionRequirement;
  index: number;
  onEdit: () => void;
  isActive: boolean;
}

const RequirementCard: React.FC<RequirementCardProps> = ({
  requirement,
  index,
  onEdit,
  isActive,
}) => {
  const [isDragging, setIsDragging] = React.useState(false);

  const isCondition = isRequirementSourceCondition(
    requirement.requirement_source_details?.[0]?.requirement_source_id.toString()
  );

  const onSuccess = () => {
    notify.success("Requirement sort order updated");
  };

  const { mutate: updateInspectionRequirementOrder } =
    useUpdateInspectionRequirementOrder(onSuccess);

  return (
    <Reorder.Item
      key={requirement.id}
      value={requirement}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => {
        updateInspectionRequirementOrder({
          inspectionId: requirement.inspection_id,
          requirementId: requirement.id,
          sortOrder: index + 1,
        });
        setTimeout(() => setIsDragging(false), 100);
      }}
    >
      <Box
        sx={{
          backgroundColor: BCDesignTokens.surfaceColorBackgroundWhite,
          mb: 2,
          border: `1px solid ${BCDesignTokens.surfaceColorBorderDefault}`,
          borderRadius: BCDesignTokens.layoutBorderRadiusMedium,
          "&:hover": {
            cursor: "pointer",
            boxShadow: `0px 4px 6px 0px ${BCDesignTokens.surfaceColorBorderDefault}`,
          },
          ...(isActive && {
            borderColor: BCDesignTokens.surfaceColorBorderActive,
          }),
        }}
        onClick={() => {
          if (!isDragging) {
            onEdit();
          }
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            p: "0.75rem 1.5rem",
            pl: 0,
            backgroundColor: BCDesignTokens.surfaceColorBackgroundLightGray,
          }}
        >
          <DragIndicatorRounded
            sx={{ mx: 0.5, mb: 0.25, fontSize: "1.125rem" }}
            color="action"
          />
          <Typography variant="body1">
            #{index + 1}. {requirement.summary}
          </Typography>
        </Box>
        <Box sx={{ p: "0.5rem 1.5rem 1rem" }}>
          <Grid container spacing={0.5}>
            <Grid item xs={12}>
              <Typography
                variant="body2"
                color={BCDesignTokens.typographyColorPlaceholder}
              >
                Topic
              </Typography>
              <Typography variant="body1">{requirement.topic.name}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography
                variant="body2"
                color={BCDesignTokens.typographyColorPlaceholder}
              >
                Source
              </Typography>
              <Typography variant="body1">
                {
                  requirement.requirement_source_details?.[0]
                    ?.requirement_source?.name
                }
              </Typography>
            </Grid>
            <Grid item xs={8}>
              <Typography
                variant="body2"
                color={BCDesignTokens.typographyColorPlaceholder}
              >
                {isCondition ? "Condition #" : "Section #"}
              </Typography>
              <Typography variant="body1">
                {isCondition
                  ? requirement.requirement_source_details?.[0]
                      ?.condition_number
                  : requirement.requirement_source_details?.[0]?.section_number}
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography
                variant="body2"
                color={BCDesignTokens.typographyColorPlaceholder}
              >
                Compliance Finding
              </Typography>
              <Typography variant="body1">
                {requirement.compliance_finding?.name}
              </Typography>
            </Grid>
            <Grid item xs={8}>
              <Typography
                variant="body2"
                color={BCDesignTokens.typographyColorPlaceholder}
              >
                Enforcement Action
              </Typography>
              <Typography variant="body1">
                {requirement.enforcement_action_data
                  .map((action) => action.name)
                  .join(", ")}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Reorder.Item>
  );
};

export default RequirementCard;
