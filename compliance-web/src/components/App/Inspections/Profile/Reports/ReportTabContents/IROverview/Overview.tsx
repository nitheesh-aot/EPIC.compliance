import { Box, IconButton, Typography } from "@mui/material";
import GridLabelValuePair from "@/components/Shared/GridLabelValuePair";
import { Grid } from "@mui/material";
import { BCDesignTokens } from "epic.theme";
import { useReportStore } from "@/components/App/Inspections/Profile/Reports/reportStore";
import { EditOutlined } from "@mui/icons-material";
import { AttendanceEnum } from "@/components/App/Inspections/InspectionFormUtils";
import dateUtils from "@/utils/dateUtils";
import { useMemo } from "react";
import { StaffUser } from "@/models/Staff";
import { InspectionAttendance } from "@/models/Attendance";
import ProjectOverview from "./ProjectOverview";

const Overview = () => {
  const { inspectionData } = useReportStore();

  const inAttendance = useMemo(() => {
    return inspectionData?.inspectionAttendances
      ?.filter(
        (attendance) =>
          attendance.attendance_option.id !== AttendanceEnum.OFFICERS
      )
      ?.map((attendance) => {
        if (attendance.data) {
          if (Array.isArray(attendance.data)) {
            return attendance.data.map((item) => item.name).join(", ");
          } else if (typeof attendance.data === "string") {
            return attendance.data;
          }
        } else {
          return attendance.attendance_option.name;
        }
      })
      .join(", ");
  }, [inspectionData]);

  const inspectingOfficers: StaffUser[] = useMemo(() => {
    const primaryOfficer = inspectionData?.primary_officer
      ? [inspectionData.primary_officer]
      : [];

    const attendingOfficers =
      inspectionData?.inspectionAttendances
        ?.filter(
          (attendance) =>
            attendance.attendance_option.id === AttendanceEnum.OFFICERS
        )
        .flatMap((attendance: InspectionAttendance) => {
          // Handle array of officers
          if (attendance.data && Array.isArray(attendance.data)) {
            return attendance.data;
          }
          return [];
        }) ?? [];

    return [...primaryOfficer, ...attendingOfficers].filter(
      (officer): officer is StaffUser => officer !== null
    );
  }, [inspectionData]);

  return (
    <>
      <ProjectOverview />
      <Box
        aria-label="IR Overview"
        sx={{
          border: `1px solid ${BCDesignTokens.surfaceColorBorderDefault}`,
          borderRadius: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 3,
            height: 40,
            borderBottom: `1px solid ${BCDesignTokens.surfaceColorBorderDefault}`,
          }}
        >
          <Typography variant="body1">IR Overview</Typography>
          <IconButton
            size="small"
            color="secondary"
            onClick={() => {}}
            data-testid={`ir-overview-edit`}
          >
            <EditOutlined />
          </IconButton>
        </Box>
        <Grid container spacing={1} sx={{ px: 3, py: 2 }}>
          <GridLabelValuePair
            label="Project Status"
            value={inspectionData?.project_status?.name}
            gridProps={{ xs: 6 }}
          />
          <GridLabelValuePair
            label="Inspection Start"
            value={
              inspectionData?.start_date
                ? dateUtils.formatDate(inspectionData.start_date)
                : ""
            }
            gridProps={{ xs: 6 }}
          />
          <GridLabelValuePair
            label="Inspection Type"
            value={inspectionData?.types_text}
            gridProps={{ xs: 6 }}
          />
          <GridLabelValuePair
            label="Initiation"
            value={inspectionData?.initiation?.name}
            gridProps={{ xs: 6 }}
          />
          <GridLabelValuePair
            label="Project Description"
            value={inspectionData?.project_description}
            hideTooltip
            multiline
          />
          <GridLabelValuePair
            label="Location Description"
            value={inspectionData?.location_description}
            hideTooltip
            multiline
          />
          <GridLabelValuePair
            label="In Attendance"
            value={inAttendance}
            hideTooltip
            multiline
          />
          <GridLabelValuePair
            label="Inspecting Officer"
            value={inspectingOfficers.map((value) => (
              <span key={value.id}>{value.name}</span>
            ))}
            hideTooltip
            multiline
          />
          <GridLabelValuePair
            label="Record Prepared By"
            value={inspectionData?.primary_officer?.name}
            hideTooltip
          />
        </Grid>
      </Box>
    </>
  );
};

export default Overview;
