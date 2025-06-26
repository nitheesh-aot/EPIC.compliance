import { useInspectionsMoreDetailsByCaseFileId } from "@/hooks/useInspections";
import { CaseFile } from "@/models/CaseFile";
import { InspectionMoreDetailsEnforcementAction } from "@/models/Inspection";
import {
  EnforcementActionEnum,
  INITIATION,
  OrderProgressEnum,
  WarningLetterProgressEnum,
} from "@/utils/constants";
import { ChevronRight, ExpandLessRounded } from "@mui/icons-material";
import {
  Link,
  Chip,
  Accordion,
  AccordionSummary,
  Box,
  Typography,
  AccordionDetails,
  Grid,
} from "@mui/material";
import { Link as RouterLink } from "@tanstack/react-router";
import { BCDesignTokens } from "epic.theme";
import { Fragment, useState } from "react";

const styleOverFlowClipped = {
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
  overflow: "hidden",
};

const CaseFileInspectionsTable = ({ caseFile }: { caseFile: CaseFile }) => {
  const { data: inspections } = useInspectionsMoreDetailsByCaseFileId(
    caseFile.id
  );

  const [expandedInspections, setExpandedInspections] = useState<Set<number>>(
    new Set()
  );

  const handleAccordionChange = (inspectionId: number, expanded: boolean) => {
    setExpandedInspections((prev) => {
      const newSet = new Set(prev);
      if (expanded) {
        newSet.add(inspectionId);
      } else {
        newSet.delete(inspectionId);
      }
      return newSet;
    });
  };

  const getStatusFlagColor = (progress: { id: string; name: string }) => {
    switch (progress.id) {
      case OrderProgressEnum.DRAFTING:
        return "default";
      case OrderProgressEnum.DEPUTY_REVIEW:
        return "warning";
      case OrderProgressEnum.APPROVED:
      case OrderProgressEnum.ISSUED:
        return "success";
      default:
        return "default";
    }
  };

  const isEnforcementActionLink = (
    enforcementAction: InspectionMoreDetailsEnforcementAction | undefined
  ): boolean => {
    if (!enforcementAction?.number) return false;

    const progressId = enforcementAction.progress?.id;

    switch (enforcementAction.id) {
      case EnforcementActionEnum.ORDER:
        return progressId === OrderProgressEnum.ISSUED;
      case EnforcementActionEnum.WARNING_LETTER:
        return progressId === WarningLetterProgressEnum.ISSUED;
      default:
        return false;
    }
  };

  return (
    (caseFile.initiation.id === INITIATION.INSPECTION_ID ||
      (inspections && inspections?.length > 0)) && (
      <>
        <Typography variant="h6" mt={2} mb={1}>
          Inspections
        </Typography>
        {inspections && inspections.length > 0 ? (
          inspections.map((inspection, index) => {
            const isExpanded = expandedInspections.has(inspection.id);

            return (
              <Accordion
                key={inspection.id}
                expanded={isExpanded}
                onChange={(_, expanded) => {
                  handleAccordionChange(inspection.id, expanded);
                }}
                sx={{
                  marginY: "0.5rem",
                  border: `1px solid ${BCDesignTokens.surfaceColorBorderDefault}`,
                  borderRadius: BCDesignTokens.layoutBorderRadiusMedium,
                  "&.Mui-expanded": {
                    marginY: "0.5rem",
                  },
                  "&:before": {
                    display: "none",
                  },
                }}
              >
                <AccordionSummary
                  aria-controls={`panel${index}-content`}
                  id={`inspection-panel${index}-header`}
                  sx={{
                    backgroundColor:
                      BCDesignTokens.surfaceColorBackgroundLightGray,
                    borderRadius: BCDesignTokens.layoutBorderRadiusMedium,
                    "&.Mui-expanded": {
                      minHeight: "48px",
                      padding: "0.875rem 1rem",
                      borderBottom: `1px solid ${BCDesignTokens.surfaceColorBorderDefault}`,
                      "& .MuiAccordionSummary-content": {
                        margin: "0",
                      },
                    },
                    "& .MuiAccordionSummary-content": {
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "1rem",
                    },
                  }}
                >
                  <Box display={"flex"} alignItems={"center"} gap={0.5}>
                    {isExpanded ? <ExpandLessRounded /> : <ChevronRight />}
                    <Link
                      component={RouterLink}
                      to="/ce-database/inspections/$inspectionNumber"
                      params={{
                        inspectionNumber: inspection.ir_number,
                      }}
                      underline="hover"
                    >
                      {inspection.ir_number}
                    </Link>
                    <Chip
                      label={inspection.inspection_status}
                      data-testid="status-chip"
                      color={
                        inspection.inspection_status?.toLowerCase() === "open"
                          ? "success"
                          : "error"
                      }
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                  <Box display={"flex"} alignItems={"center"} gap={0.5}>
                    <Typography
                      variant="body2"
                      color={BCDesignTokens.typographyColorPlaceholder}
                      mr={0.25}
                    >
                      Primary:
                    </Typography>
                    <Typography variant="body2">
                      {inspection.primary_officer?.name || "N/A"}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ padding: "1rem" }}>
                  <Grid container spacing={1}>
                    <Grid item xs={4}>
                      <Typography
                        variant="body2"
                        color={BCDesignTokens.typographyColorPlaceholder}
                      >
                        Requirement Summary
                      </Typography>
                    </Grid>
                    <Grid item xs={2}>
                      <Typography
                        variant="body2"
                        color={BCDesignTokens.typographyColorPlaceholder}
                      >
                        #
                      </Typography>
                    </Grid>
                    <Grid item xs={2}>
                      <Typography
                        variant="body2"
                        color={BCDesignTokens.typographyColorPlaceholder}
                      >
                        Source
                      </Typography>
                    </Grid>
                    <Grid item xs={2}>
                      <Typography
                        variant="body2"
                        sx={{
                          ...styleOverFlowClipped,
                          color: BCDesignTokens.typographyColorPlaceholder,
                        }}
                      >
                        Enforcement Action
                      </Typography>
                    </Grid>
                    <Grid item xs={2}>
                      <Typography
                        variant="body2"
                        color={BCDesignTokens.typographyColorPlaceholder}
                      >
                        Enf. Status
                      </Typography>
                    </Grid>
                    {inspection.requirement_details?.map(
                      (requirement, index) => (
                        <Fragment key={index}>
                          <Grid item xs={4}>
                            <Typography
                              variant="body2"
                              sx={{ ...styleOverFlowClipped }}
                            >
                              #{requirement.requirement_sort_order}.{" "}
                              {requirement.requirement_summary}
                            </Typography>
                          </Grid>
                          <Grid item xs={2} sx={{ ...styleOverFlowClipped }}>
                            {requirement.requirement_source_name?.toLowerCase() ===
                            "order" ? (
                              <Link
                                underline="hover"
                                sx={{ cursor: "pointer" }}
                              >
                                {(requirement.requirement_number ?? "")
                                  .split("_")
                                  .slice(1)
                                  .join("_")}
                              </Link>
                            ) : (
                              <Typography variant="body2">
                                {requirement.requirement_number}
                              </Typography>
                            )}
                          </Grid>
                          <Grid item xs={2}>
                            <Typography
                              variant="body2"
                              sx={{ ...styleOverFlowClipped }}
                            >
                              {requirement.requirement_source_name}
                            </Typography>
                          </Grid>
                          <Grid item xs={2} sx={{ ...styleOverFlowClipped }}>
                            {isEnforcementActionLink(
                              requirement.enforcement_action
                            ) ? (
                              <Link
                                underline="hover"
                                sx={{ cursor: "pointer" }}
                              >
                                {requirement.enforcement_action?.name}
                              </Link>
                            ) : (
                              <Typography
                                variant="body2"
                                sx={{ ...styleOverFlowClipped }}
                              >
                                {requirement.enforcement_action?.name}
                              </Typography>
                            )}
                          </Grid>
                          <Grid item xs={2}>
                            {requirement.enforcement_action?.progress && (
                              <Chip
                                label={
                                  requirement.enforcement_action?.progress?.name
                                }
                                color={getStatusFlagColor(
                                  requirement.enforcement_action?.progress
                                )}
                                variant="outlined"
                                size="small"
                              />
                            )}
                          </Grid>
                        </Fragment>
                      )
                    )}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            );
          })
        ) : (
          <Typography
            variant="body2"
            color={BCDesignTokens.typographyColorPlaceholder}
          >
            You do not have any created inspections on this file.
          </Typography>
        )}
      </>
    )
  );
};

export default CaseFileInspectionsTable;
