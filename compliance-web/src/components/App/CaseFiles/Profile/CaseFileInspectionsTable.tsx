import GridLabelValuePair from "@/components/Shared/GridLabelValuePair";
import { useInspectionsByCaseFileId } from "@/hooks/useInspections";
import { CaseFile } from "@/models/CaseFile";
import { INITIATION } from "@/utils/constants";
import dateUtils from "@/utils/dateUtils";
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
import { useState } from "react";

const CaseFileInspectionsTable = ({ caseFile }: { caseFile: CaseFile }) => {
  const { data: inspections } = useInspectionsByCaseFileId(caseFile.id);

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
                  <Grid container spacing={2}>
                    <GridLabelValuePair
                      label="Location"
                      value={inspection.location_description || "N/A"}
                      gridProps={{ xs: 8 }}
                    />
                    <GridLabelValuePair
                      label="Date"
                      value={dateUtils.formatDate(inspection.start_date)}
                      gridProps={{ xs: 2 }}
                    />
                    <GridLabelValuePair
                      label="Status"
                      value={inspection.inspection_status || "N/A"}
                      gridProps={{ xs: 2 }}
                    />
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
