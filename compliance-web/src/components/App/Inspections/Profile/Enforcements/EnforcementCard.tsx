import GridLabelValuePair from "@/components/Shared/GridLabelValuePair";
import { InspectionOrder } from "@/models/InspectionOrder";
import { InspectionRequirement } from "@/models/InspectionRequirement";
import { InspectionWarningLetter } from "@/models/InspectionWarningLetter";
import dateUtils from "@/utils/dateUtils";
import { Box, Grid, Stack, Typography } from "@mui/material";
import { BCDesignTokens } from "epic.theme";
import EnforcementStatusFlag from "@/components/App/Inspections/Profile/Enforcements/EnforcementStatusFlag";
import {
  formatRequirementSummary,
  formatRequirementSources,
  getSentForReviewDate,
  getApprovedByDate,
  getApproverName,
} from "@/components/App/Inspections/Profile/Enforcements/EnforcementUtils";

const EnforcementCard = ({
  order,
  warningLetter,
  requirementEnforcements,
}: {
  order?: InspectionOrder;
  warningLetter?: InspectionWarningLetter;
  requirementEnforcements: InspectionRequirement[];
}) => {
  // Use utility functions instead of complex useMemo and useCallback logic
  const requirementSummaryFormatted = formatRequirementSummary(
    order,
    warningLetter
  );
  const requirementSourcesFormatted = formatRequirementSources(
    requirementEnforcements,
    order,
    warningLetter
  );
  const sentForReviewDate = getSentForReviewDate(order, warningLetter);
  const approvedByDate = getApprovedByDate(order, warningLetter);
  const approverName = getApproverName(order, warningLetter);

  return (
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
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: "0.75rem 1.5rem",
          backgroundColor: BCDesignTokens.surfaceColorBackgroundLightGray,
        }}
      >
        <Stack direction="row" alignItems="center" gap={1}>
          <Typography
            variant="body1"
            color={BCDesignTokens.typographyColorLink}
          >
            {order?.order_number ?? warningLetter?.warning_letter_number}
          </Typography>
          <EnforcementStatusFlag order={order} warningLetter={warningLetter} />
        </Stack>
        <Stack>
          {requirementSourcesFormatted?.map((source, index) => {
            return (
              <Typography key={index} variant="caption" component={"div"}>
                {source}
              </Typography>
            );
          })}
        </Stack>
      </Box>
      <Box
        sx={{
          p: "0.5rem 1.5rem 1rem",
        }}
      >
        <Grid container spacing={0.5}>
          <GridLabelValuePair
            label="Requirement Summary"
            value={requirementSummaryFormatted}
            multiline
          />
          <GridLabelValuePair
            label="Deputy Director, Compliance & Enforcement Operations"
            value={approverName}
          />
          <GridLabelValuePair
            label="Sent for Review"
            value={sentForReviewDate}
            gridProps={{ xs: 3 }}
          />
          <GridLabelValuePair
            label="Approved by Deputy"
            value={approvedByDate}
            gridProps={{ xs: 3 }}
          />
          <GridLabelValuePair
            label="Date Issued"
            value={
              (order || warningLetter)?.date_issued
                ? dateUtils.formatDate(
                    (order || warningLetter)?.date_issued ?? ""
                  )
                : ""
            }
            gridProps={{ xs: 6 }}
          />
        </Grid>
      </Box>
    </Box>
  );
};

export default EnforcementCard;
