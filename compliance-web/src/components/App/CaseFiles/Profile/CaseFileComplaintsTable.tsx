import GridLabelValuePair from "@/components/Shared/GridLabelValuePair";
import { useComplaintsByCaseFileId } from "@/hooks/useComplaints";
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
  Skeleton,
} from "@mui/material";
import { Link as RouterLink } from "@tanstack/react-router";
import { BCDesignTokens } from "epic.theme";
import { useState } from "react";

const CaseFileComplaintsTable = ({ caseFileId }: { caseFileId: number }) => {
  const { data: complaints, isLoading } = useComplaintsByCaseFileId(caseFileId);

  const [expandedComplaints, setExpandedComplaints] = useState<Set<number>>(
    new Set()
  );

  const handleAccordionChange = (complaintId: number, expanded: boolean) => {
    setExpandedComplaints((prev) => {
      const newSet = new Set(prev);
      if (expanded) {
        newSet.add(complaintId);
      } else {
        newSet.delete(complaintId);
      }
      return newSet;
    });
  };

  return (
    <>
      <Typography variant="h6" mt={2} mb={1}>
        Complaints
      </Typography>
      {isLoading && <Skeleton variant="rectangular" height={100} />}
      {complaints && complaints.length > 0 ? (
        complaints.map((complaint, index) => {
          const isExpanded = expandedComplaints.has(complaint.id);

          return (
            <Accordion
              key={complaint.id}
              expanded={isExpanded}
              onChange={(_, expanded) => {
                handleAccordionChange(complaint.id, expanded);
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
                id={`requirement-source-panel${index}-header`}
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
                    to="/ce-database/complaints/$complaintNumber"
                    params={{
                      complaintNumber: complaint.complaint_number,
                    }}
                    underline="hover"
                  >
                    {complaint.complaint_number}
                  </Link>
                  <Chip
                    label={complaint.status}
                    color={
                      complaint.status?.toLowerCase() === "open"
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
                  <Typography variant="body2">Christie Lombardi</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ padding: "1rem" }}>
                <Grid container spacing={2}>
                  <GridLabelValuePair
                    label="Concern Description"
                    value={complaint.concern_description}
                    gridProps={{ xs: 8 }}
                  />
                  <GridLabelValuePair
                    label="Source"
                    value={complaint.source_type?.name}
                    gridProps={{ xs: 2 }}
                  />
                  <GridLabelValuePair
                    label="Date Received"
                    value={dateUtils.formatDate(complaint.date_received)}
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
          You do not have any created complaints on this file.
        </Typography>
      )}
    </>
  );
};

export default CaseFileComplaintsTable;
