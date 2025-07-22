import GridLabelValuePair from "@/components/Shared/GridLabelValuePair";
import { InspectionOrder } from "@/models/InspectionOrder";
import { InspectionRequirement } from "@/models/InspectionRequirement";
import { InspectionWarningLetter } from "@/models/InspectionWarningLetter";
import dateUtils from "@/utils/dateUtils";
import { Box, Grid, Stack, Typography } from "@mui/material";
import { BCDesignTokens } from "epic.theme";
import { useCallback, useMemo } from "react";
import EnforcementStatusFlag from "./EnforcementStatusFlag";

const EnforcementCard = ({
  order,
  warningLetter,
  requirementEnforcements,
}: {
  order?: InspectionOrder;
  warningLetter?: InspectionWarningLetter;
  requirementEnforcements: InspectionRequirement[];
}) => {
  const requirementSummaryFormatted = useMemo(() => {
    if (order?.order_requirement_maps) {
      return order.order_requirement_maps
        .map((map) => map.inspection_requirement.summary)
        .join(", ");
    }
    if (warningLetter?.warning_letter_requirement_maps) {
      return warningLetter.warning_letter_requirement_maps
        .map((map) => map.inspection_requirement.summary)
        .join(", ");
    }
    return "No requirement summary available";
  }, [order, warningLetter]);

  const requirementSourcesFormatted = useMemo(() => {
    const orderRequirementIds = order?.order_requirement_maps?.map(
      (map) => map.inspection_requirement_id
    );
    const warningLetterRequirementIds =
      warningLetter?.warning_letter_requirement_maps?.map(
        (map) => map.inspection_requirement_id
      );

    const requirementIds = [
      ...(orderRequirementIds || []),
      ...(warningLetterRequirementIds || []),
    ];

    const requirements = requirementEnforcements.filter((requirement) =>
      requirementIds?.includes(requirement.id)
    );

    // Flatten and transform all sources into the required format
    const result: string[] = [];

    requirements.forEach((requirement) => {
      const sourceMap = new Map<number, { name: string; numbers: string[] }>();

      requirement.requirement_source_details.forEach((source) => {
        const sourceId = source.requirement_source_id;
        const sourceName = source.requirement_source?.name || "";
        const number = source.condition_number ?? source.section_number ?? "";

        if (!sourceMap.has(sourceId)) {
          sourceMap.set(sourceId, { name: sourceName, numbers: [] });
        }

        if (number) {
          sourceMap.get(sourceId)?.numbers.push(`#${number.trim()}`);
        }
      });

      sourceMap.forEach((value) => {
        if (value.numbers.length > 0) {
          result.push(`${value.name}, ${value.numbers.join(", ")}`);
        } else {
          result.push(value.name);
        }
      });
    });
    return result;
  }, [order, warningLetter, requirementEnforcements]);

  const getSentForReviewDate = useCallback(() => {
    let sentForReviewDate: string = "";
    if (order?.order_approvals) {
      sentForReviewDate = order.order_approvals?.[0]?.created_date ?? "";
    }
    if (warningLetter?.warning_letter_approvals) {
      sentForReviewDate =
        warningLetter.warning_letter_approvals?.[0]?.created_date ?? "";
    }
    return sentForReviewDate ? dateUtils.formatDate(sentForReviewDate) : "";
  }, [order, warningLetter]);

  const getApprovedByDate = useCallback(() => {
    let approvedByDate: string = "";
    if (order?.order_approvals) {
      approvedByDate = order.order_approvals?.[0]?.approved_date ?? "";
    }
    if (warningLetter?.warning_letter_approvals) {
      approvedByDate =
        warningLetter.warning_letter_approvals?.[0]?.approved_date ?? "";
    }
    return approvedByDate ? dateUtils.formatDate(approvedByDate) : "";
  }, [order, warningLetter]);

  const getApproverName = useCallback(() => {
    let approverName: string = "";
    if (order?.order_approvals) {
      approverName = order.order_approvals?.[0]?.approved_by?.name ?? "";
    }
    if (warningLetter?.warning_letter_approvals) {
      approverName =
        warningLetter.warning_letter_approvals?.[0]?.approved_by?.name ?? "";
    }
    return approverName;
  }, [order, warningLetter]);

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
            value={getApproverName()}
          />
          <GridLabelValuePair
            label="Sent for Review"
            value={getSentForReviewDate()}
            gridProps={{ xs: 3 }}
          />
          <GridLabelValuePair
            label="Approved by Deputy"
            value={getApprovedByDate()}
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
