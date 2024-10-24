/// <reference types="cypress" />
import {
  InspectionFormSchema,
  // formatInspectionData,
  getProjectId,
} from "@/components/App/Inspections/InspectionFormUtils";
import { UNAPPROVED_PROJECT_ID } from "@/utils/constants";
import dateUtils from "@/utils/dateUtils";

describe("InspectionFormUtils", () => {
  describe("InspectionFormSchema Validation", () => {
    it("validates successfully with correct data", () => {
      const validData = {
        project: { id: 1, name: "Project Alpha" },
        authorization: "Authorization 123",
        regulatedParty: "Company XYZ",
        projectDescription: "Project Description",
        projectType: "Type A",
        projectSubType: "Sub Type B",
        locationDescription: "Location A",
        utm: "9U 454135 6399452",
        primaryOfficer: { id: 1, full_name: "John Doe" },
        officers: [{ id: 2, full_name: "Jane Smith" }],
        irTypes: [{ id: 1, name: "IR Type Alpha" }],
        dateRange: {
          startDate: new Date(),
          endDate: dateUtils.add(new Date(), 1, "day"),
        },
        initiation: { id: 1, name: "Initiation Alpha" },
        irStatus: { id: 1, name: "Status 1" },
        projectStatus: { id: 1, name: "Status 1" },
        inAttendance: [{ id: 1, name: "Agency 1" }],
        municipal: "Municipal Info",
        other: "Other Info",
        firstNations: [{ id: 1, name: "First Nation 1" }],
        agencies: [{ id: 1, name: "Agency 1" }],
      };

      InspectionFormSchema.validate(validData).then((validatedData) => {
        expect(validatedData).to.deep.equal(validData);
      });
    });

    it("fails validation when required fields are missing", () => {
      const invalidData = {
        project: null,
        primaryOfficer: null,
        irTypes: [],
        dateRange: {},
        initiation: null,
      };

      InspectionFormSchema.validate(invalidData).catch((err) => {
        expect(err.errors).to.include("Project is required");
        expect(err.errors).to.include("Primary is required");
        expect(err.errors).to.include("At least one Type is required");
        expect(err.errors).to.include("Start date is required");
        expect(err.errors).to.include("End date is required");
        expect(err.errors).to.include("Initiation is required");
      });
    });
  });

  // describe("formatInspectionData function", () => {
  //   it("formats data correctly for API submission", () => {
  //     const formData = {
  //       project: { id: 1, name: "Project Alpha" },
  //       authorization: "Authorization 123",
  //       regulatedParty: "Company XYZ",
  //       projectDescription: "Project Description",
  //       projectType: "Type A",
  //       projectSubType: "Sub Type B",
  //       locationDescription: "Location A",
  //       utm: "9U 454135 6399452",
  //       primaryOfficer: { id: 1, full_name: "John Doe" },
  //       officers: [{ id: 2, full_name: "Jane Smith" }],
  //       irTypes: [{ id: 1, name: "IR Type Alpha" }],
  //       dateRange: {
  //         startDate: dayjs("2023-01-01"),
  //         endDate: dayjs("2023-01-02"),
  //       },
  //       initiation: { id: 1, name: "Initiation Alpha" },
  //       irStatus: { id: 1, name: "Status 1" },
  //       projectStatus: { id: 1, name: "Status 1" },
  //       inAttendance: [{ id: 1, name: "Agency 1" }],
  //       municipal: "Municipal Info",
  //       other: "Other Info",
  //       firstNations: [{ id: 1, name: "First Nation 1" }],
  //       agencies: [{ id: 1, name: "Agency 1" }],
  //     };

  //     const expectedFormattedData = {
  //       project_id: 1,
  //       case_file_id: 123,
  //       inspection_type_ids: [1],
  //       initiation_id: 1,
  //       start_date: dayjs("2023-01-01").toISOString(),
  //       end_date: dayjs("2023-01-02").toISOString(),
  //       primary_officer_id: 1,
  //       inspection_officer_ids: [2],
  //       location_description: "Location A",
  //       utm: "9U 454135 6399452",
  //       ir_status_id: 1,
  //       project_status_id: 1,
  //       attendance_option_ids: [1],
  //       agency_attendance_ids: [1],
  //       firstnation_attendance_ids: [1],
  //       attendance_municipal: "Municipal Info",
  //       attendance_other: "Other Info",
  //     };

  //     const formattedData = formatInspectionData(formData, 123);
  //     expect(formattedData).to.deep.equal(expectedFormattedData);
  //   });
  // });

  describe("getProjectId function", () => {
    it("returns project id correctly", () => {
      const formData = {
        project: { id: 1, name: "Project Alpha" },
      };
      expect(getProjectId(formData)).to.equal(1);
    });

    it("returns undefined for unapproved project", () => {
      const formData = {
        project: { id: UNAPPROVED_PROJECT_ID, name: "Unapproved Project" },
      };
      expect(getProjectId(formData)).to.be.undefined;
    });
  });
});
