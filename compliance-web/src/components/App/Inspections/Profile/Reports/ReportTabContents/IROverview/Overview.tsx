import GridLabelValuePair from "@/components/Shared/GridLabelValuePair";
import { Grid } from "@mui/material";
import { useReportStore } from "@/components/App/Inspections/Profile/Reports/reportStore";
import { AttendanceEnum } from "@/components/App/Inspections/InspectionFormUtils";
import dateUtils from "@/utils/dateUtils";
import { useCallback, useMemo } from "react";
import { StaffUser } from "@/models/Staff";
import { InspectionAttendance } from "@/models/Attendance";
import ProjectOverview from "./ProjectOverview";
import IRBoxContainer from "../IRBoxContainer";
import { useDrawer } from "@/store/drawerStore";
import { DRAWER_WIDTHS } from "@/utils/constants";
import { CaseFile } from "@/models/CaseFile";
import InspectionDrawer from "@/components/App/Inspections/InspectionDrawer";
import { notify } from "@/store/snackbarStore";
import { useQueryClient } from "@tanstack/react-query";

const Overview = () => {
  const { inspectionData, caseFileData } = useReportStore();
  const { setOpen, setClose } = useDrawer();
  const queryClient = useQueryClient();

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
            return attendance.data as StaffUser[];
          }
          return [];
        }) ?? [];

    return [...primaryOfficer, ...attendingOfficers].filter(
      (officer): officer is StaffUser => officer !== null
    );
  }, [inspectionData]);

  const handleOnSubmit = useCallback(
    (submitMsg: string) => {
      queryClient.invalidateQueries({
        queryKey: ["inspection", inspectionData?.ir_number],
      });
      setClose();
      notify.success(submitMsg);
    },
    [queryClient, inspectionData, setClose]
  );

  const handleOpenEditModal = useCallback(() => {
    setOpen({
      content: (
        <InspectionDrawer
          onSubmit={handleOnSubmit}
          inspection={inspectionData}
          caseFile={caseFileData as CaseFile}
        />
      ),
      width: DRAWER_WIDTHS.INSPECTION_DRAWER,
    });
  }, [setOpen, handleOnSubmit, inspectionData, caseFileData]);

  const renderOfficerName = (officer: StaffUser | undefined) => {
    if (!officer) return "";
    return `${officer.name}${officer.position?.name ? ", " + officer.position?.name : ""}`;
  };

  return (
    <>
      <ProjectOverview />
      <IRBoxContainer title="IR Overview" onEdit={handleOpenEditModal}>
        <Grid container spacing={1}>
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
              <span
                style={{ lineHeight: "normal", marginBottom: "4px" }}
                key={value.id}
              >
                {renderOfficerName(value)}
              </span>
            ))}
            hideTooltip
            multiline
          />
          <GridLabelValuePair
            label="Record Prepared By"
            value={renderOfficerName(inspectionData?.primary_officer)}
            hideTooltip
          />
        </Grid>
      </IRBoxContainer>
    </>
  );
};

export default Overview;
