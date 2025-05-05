import { Agency } from "@/models/Agency";
import { Attendance } from "@/models/Attendance";
import { FirstNation } from "@/models/FirstNation";
import { Initiation } from "@/models/Initiation";
import { InspectionAPIData } from "@/models/Inspection";
import { IRType } from "@/models/IRType";
import { ProjectStatus } from "@/models/ProjectStatus";
import { StaffUser } from "@/models/Staff";
import dateUtils from "@/utils/dateUtils";
import { Dayjs } from "dayjs";
import * as yup from "yup";

export enum AttendanceEnum {
  AGENCIES = "1",
  FIRST_NATIONS = "2",
  MUNICIPAL = "3",
  OTHER = "7",
  OFFICERS = "8",
}

export const InspectionFormSchema = yup.object().shape({
  projectDescription: yup.string().nullable(),
  locationDescription: yup.string().nullable(),
  utm: yup.string().nullable(),
  primaryOfficer: yup
    .object<StaffUser>()
    .nullable()
    .required("Primary is required"),
  irTypes: yup
    .array()
    .of(yup.object<IRType>())
    .min(1, "At least one Type is required")
    .required("Type is required"),
  startDate: yup
    .mixed<Dayjs>()
    .required("Start date is required")
    .typeError("Invalid date"),
  endDate: yup
    .mixed<Dayjs>()
    .nullable()
    .typeError("Invalid date"),
  debriefDate: yup
    .mixed<Dayjs>()
    .nullable()
    .optional()
    .typeError("Invalid date"),
  initiation: yup
    .object<Initiation>()
    .nullable()
    .required("Initiation is required"),
  projectStatus: yup.object<ProjectStatus>().nullable(),

  inAttendance: yup.array().of(yup.object<Attendance>()).nullable(),

  // Adding dynamic fields conditionally required based on `inAttendance` selection
  municipal: yup
    .string()
    .nullable()
    .when("inAttendance", {
      is: (attendance: Attendance[]) =>
        attendance?.some((item) => item.id === AttendanceEnum.MUNICIPAL),
      then: (schema) => schema.required("Municipal is required"),
      otherwise: (schema) => schema.notRequired(),
    }),

  other: yup
    .string()
    .nullable()
    .when("inAttendance", {
      is: (attendance: Attendance[]) => {
        return attendance?.some((item) => item.id === AttendanceEnum.OTHER);
      },
      then: (schema) => schema.required("Other is required"),
      otherwise: (schema) => schema.notRequired(),
    }),

  firstNations: yup
    .array()
    .of(yup.object<FirstNation>())
    .nullable()
    .when("inAttendance", {
      is: (attendance: Attendance[]) =>
        attendance?.some((item) => item.id === AttendanceEnum.FIRST_NATIONS),
      then: (schema) =>
        schema
          .min(1, "At least one First Nation is required")
          .required("First Nations is required"),
      otherwise: (schema) => schema.notRequired(),
    }),

  agencies: yup
    .array()
    .of(yup.object<Agency>())
    .nullable()
    .when("inAttendance", {
      is: (attendance: Attendance[]) =>
        attendance?.some((item) => item.id === AttendanceEnum.AGENCIES),
      then: (schema) =>
        schema
          .min(1, "At least one Agency is required")
          .required("Agencies are required"),
      otherwise: (schema) => schema.notRequired(),
    }),

  officers: yup
    .array()
    .of(yup.object<StaffUser>())
    .nullable()
    .when("inAttendance", {
      is: (attendance: Attendance[]) =>
        attendance?.some((item) => item.id === AttendanceEnum.OFFICERS),
      then: (schema) =>
        schema
          .min(1, "At least one Officer is required")
          .required("Officers are required"),
      otherwise: (schema) => schema.notRequired(),
    }),
});

export type InspectionSchemaType = yup.InferType<typeof InspectionFormSchema>;

// Formatting inspection form data for API
export const formatInspectionData = (
  formData: InspectionSchemaType,
  caseFileId?: number // use as a flag for create new inspection mode
) => {
  const inAttendanceOptions =
    (formData.inAttendance as Attendance[])?.map((att) => att.id) ?? [];

  let inspectionData: InspectionAPIData = {
    project_description: formData.projectDescription ?? "",
    inspection_type_ids:
      (formData.irTypes as IRType[])?.map((ir) => ir.id) ?? [],
    initiation_id: (formData.initiation as Initiation).id,
    start_date: dateUtils.dateToISO(formData.startDate ?? new Date()),
    end_date: formData.endDate
      ? dateUtils.dateToISO(formData.endDate)
      : undefined,
    debrief_date: formData.debriefDate &&
      formData.debriefDate.isValid?.()
      ? dateUtils.dateToISO(formData.debriefDate)
      : undefined,
    primary_officer_id: (formData.primaryOfficer as StaffUser)?.id,
    location_description: formData.locationDescription ?? "",
    utm: formData.utm ?? "",
    project_status_id: (formData.projectStatus as ProjectStatus)?.id,
    attendance_option_ids: inAttendanceOptions,
  };
  if (inAttendanceOptions.length) {
    // Create an object to hold the attendance-related data
    const attendanceData: Partial<InspectionAPIData> = {};

    if (inAttendanceOptions.includes(AttendanceEnum.AGENCIES)) {
      attendanceData.agency_attendance_ids =
        (formData.agencies as Agency[])?.map((item) => item.id) ?? [];
    }

    if (inAttendanceOptions.includes(AttendanceEnum.FIRST_NATIONS)) {
      attendanceData.firstnation_attendance_ids =
        (formData.firstNations as FirstNation[])?.map((item) => item.id) ?? [];
    }

    if (inAttendanceOptions.includes(AttendanceEnum.OFFICERS)) {
      attendanceData.attending_officer_ids =
        (formData.officers as StaffUser[])?.map((item) => item.id) ?? [];
    }

    if (inAttendanceOptions.includes(AttendanceEnum.MUNICIPAL)) {
      attendanceData.attendance_municipal = formData.municipal ?? "";
    }

    if (inAttendanceOptions.includes(AttendanceEnum.OTHER)) {
      attendanceData.attendance_other = formData.other ?? "";
    }

    // Merge the attendance data with the inspection data
    inspectionData = {
      ...attendanceData,
      ...inspectionData,
    };
  }
  inspectionData.case_file_id = caseFileId ?? undefined; // map the fields only for create new inspection, and case file id is available

  return inspectionData;
};
