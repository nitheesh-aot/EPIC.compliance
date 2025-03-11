import { Box, Button, IconButton, Link, Typography } from "@mui/material";
import GridLabelValuePair from "@/components/Shared/GridLabelValuePair";
import { Grid } from "@mui/material";
import { BCDesignTokens } from "epic.theme";
import { useReportStore } from "@/components/App/Inspections/Profile/Reports/reportStore";
import { AddRounded, EditOutlined } from "@mui/icons-material";
import { AttendanceEnum } from "@/components/App/Inspections/InspectionFormUtils";
import dateUtils from "@/utils/dateUtils";
import MailingAddressPopover from "./MailingAddressPopover";
import { usePopover } from "@/store/popoverStore";
import { useMemo, useState } from "react";
import { StaffUser } from "@/models/Staff";
import { InspectionAttendance } from "@/models/Attendance";

const Overview = () => {
  const { inspectionData } = useReportStore();
  const { setOpen, setClose } = usePopover();
  const [mailingAddress, setMailingAddress] = useState("");

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

  const updateMailingAddress = (mailingAddress: string) => {
    setMailingAddress(mailingAddress);
    setClose();
  };

  const addMailingAddress = (event: React.MouseEvent<HTMLButtonElement>) => {
    setOpen({
      anchorEl: event.currentTarget,
      content: <MailingAddressPopover onSubmit={updateMailingAddress} />,
      width: "440px",
    });
  };

  const editMailingAddress = (
    event: React.MouseEvent<HTMLAnchorElement>,
    mailingAddress: string
  ) => {
    setOpen({
      anchorEl: event.currentTarget,
      content: (
        <MailingAddressPopover
          onSubmit={updateMailingAddress}
          mailingAddress={mailingAddress}
        />
      ),
      width: "440px",
    });
  };

  return (
    <>
      <Box
        sx={{
          backgroundColor: BCDesignTokens.surfaceColorBackgroundLightBlue,
          py: 2,
          px: 3,
          borderRadius: 1,
          mb: 1,
        }}
      >
        <Grid container spacing={1}>
          <GridLabelValuePair
            label="Project"
            value={inspectionData?.case_file?.project?.name}
          />
          <GridLabelValuePair
            label="Inspection No."
            value={inspectionData?.ir_number}
            gridProps={{ xs: 6 }}
          />
          <GridLabelValuePair
            label="IR Status"
            value={inspectionData?.ir_status?.name}
            gridProps={{ xs: 6 }}
          />
          <GridLabelValuePair
            label="Regulated Party"
            value="track_api"
            gridProps={{ xs: 6 }}
          />
          <GridLabelValuePair
            label="EA Certificate #"
            value="track_api"
            gridProps={{ xs: 6 }}
          />
          <Grid item xs={12}>
            <Typography
              variant="body2"
              color={BCDesignTokens.typographyColorPlaceholder}
            >
              Mailing Address
            </Typography>
            {mailingAddress ? (
              <Link
                sx={{
                  display: "flex",
                  gap: 0.75,
                  cursor: "pointer",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
                underline="none"
                onClick={(e) => editMailingAddress(e, mailingAddress)}
              >
                {mailingAddress}
              </Link>
            ) : (
              <Button
                variant="text"
                color="secondary"
                size="small"
                onClick={addMailingAddress}
                startIcon={<AddRounded />}
                sx={{
                  backgroundColor: "transparent",
                  px: 0,
                  height: "auto",
                  "& .MuiButton-startIcon": {
                    mr: 0,
                  },
                }}
              >
                Add Mailing Address
              </Button>
            )}
          </Grid>
          <GridLabelValuePair label="Record Approved By" value="" />
        </Grid>
      </Box>
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
