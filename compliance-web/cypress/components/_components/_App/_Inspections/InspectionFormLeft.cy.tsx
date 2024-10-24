/// <reference types="cypress" />
import { mount } from "cypress/react18";
import InspectionFormLeft from "@/components/App/Inspections/InspectionFormLeft"; // Adjust the path accordingly
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FormProvider, useForm } from "react-hook-form";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"; // Use your chosen date adapter

// Mock data for the form inputs
const mockProjects = [
  { id: 1, name: "Project Alpha" },
  { id: 2, name: "Project Beta" },
];

const mockInitiations = [
  { id: "1", name: "Initiation Alpha" },
  { id: "2", name: "Initiation Beta" },
];

const mockStaffUsers = [
  { id: 1, full_name: "John Doe" },
  { id: 2, full_name: "Jane Smith" },
];

const mockIRTypes = [
  { id: "1", name: "IR Type Alpha" },
  { id: "2", name: "IR Type Beta" },
];

describe("InspectionFormLeft Component", () => {
  const setup = () => {
    const queryClient = new QueryClient();

    // Create a wrapper component to provide react-hook-form and LocalizationProvider context
    const Wrapper = ({ children }: { children: React.ReactNode }) => {
      const methods = useForm({
        defaultValues: {
          project: null,
          locationDescription: "",
          utm: "",
          primaryOfficer: null,
          officers: [],
          irTypes: [],
          dateRange: [null, null],
          initiation: null,
        },
      });

      return (
        <QueryClientProvider client={queryClient}>
          <FormProvider {...methods}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              {children}
            </LocalizationProvider>
          </FormProvider>
        </QueryClientProvider>
      );
    };

    mount(
      <Wrapper>
        <InspectionFormLeft
          projectList={mockProjects}
          initiationList={mockInitiations}
          staffUsersList={mockStaffUsers}
          irTypeList={mockIRTypes}
        />
      </Wrapper>
    );
  };

  beforeEach(() => {
    setup();
  });

  it("renders the form with all fields", () => {
    // Check that all the labels exist
    cy.contains("Project").should("exist");
    cy.contains("Location Description (optional)").should("exist");
    cy.contains("UTM (optional)").should("exist");
    cy.contains("Primary").should("exist");
    cy.contains("Type").should("exist");
    cy.contains("Dates").should("exist");
    cy.contains("Initiation").should("exist");
  });

  it("allows selecting a project", () => {
    cy.get('input[name="project"]').click();
    cy.get("li").contains("Project Alpha").click();
    cy.get('input[name="project"]').should("have.value", "Project Alpha");
  });

  it("allows entering a location description", () => {
    cy.get('textarea[name="locationDescription"]').type("Inspection at Site A");
    cy.get('textarea[name="locationDescription"]').should(
      "have.value",
      "Inspection at Site A"
    );
  });

  it("allows entering UTM coordinates", () => {
    cy.get('input[name="utm"]').type("9U 454135 6399452");
    cy.get('input[name="utm"]').should("have.value", "9U 454135 6399452");
  });

  it("allows selecting lead officer", () => {
    cy.get('input[name="primaryOfficer"]').click();
    cy.get("li").contains("John Doe").click();
    cy.get('input[name="primaryOfficer"]').should("have.value", "John Doe");
  });

  it("allows selecting multiple IR types", () => {
    cy.get('input[name="irTypes"]').click();
    cy.get("li").contains("IR Type Alpha").click();
    cy.get("li").contains("IR Type Beta").click();

    // Verify that both selected IR types appear as tags
    cy.get('.MuiAutocomplete-root[name="irTypes"]').within(() => {
      cy.get(".MuiAutocomplete-tag").should("have.length", 2);
      cy.get(".MuiAutocomplete-tag")
        .eq(0)
        .should("contain.text", "IR Type Alpha");
      cy.get(".MuiAutocomplete-tag")
        .eq(1)
        .should("contain.text", "IR Type Beta");
    });
  });

  it("allows selecting a date range", () => {
    cy.get('input[name="dateRange"]').click();
    cy.get(".MuiPickersDay-root").contains("10").click(); // Select the start date
    cy.get(".MuiPickersDay-root").contains("20").click(); // Select the end date
    cy.get('input[name="dateRange"]').should("contain.value", "10");
    cy.get('input[name="dateRange"]').should("contain.value", "20");
  });

  it("allows selecting initiation", () => {
    cy.get('input[name="initiation"]').click();
    cy.get("li").contains("Initiation Beta").click();
    cy.get('input[name="initiation"]').should("have.value", "Initiation Beta");
  });
});
