/// <reference types="cypress" />
import { mount } from "cypress/react18";
import CaseFileForm from "@/components/App/CaseFiles/CaseFileForm";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FormProvider, useForm } from "react-hook-form";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"; // Use the correct adapter for date handling (e.g., date-fns, moment, dayjs, luxon, etc.)
import { Initiation } from "@/models/Initiation";

// Mock data for projects, initiations, and staff users
const mockProjects = [
  { id: 1, name: "Project Alpha" },
  { id: 2, name: "Project Beta" },
];

const mockInitiations: Initiation[] = [
  { id: "1", name: "Initiation Alpha" },
  { id: "2", name: "Initiation Beta" },
];

const mockStaffUsers = [
  { id: 1, full_name: "John Doe" },
  { id: 2, full_name: "Jane Smith" },
  { id: 3, full_name: "Alice Johnson" },
];

describe("CaseFileForm Component", () => {
  const setup = () => {
    const queryClient = new QueryClient();

    // Create a wrapper component to provide react-hook-form and LocalizationProvider context
    const Wrapper = ({ children }: { children: React.ReactNode }) => {
      const methods = useForm({
        defaultValues: {
          project: null,
          dateCreated: null,
          leadOfficer: null,
          officers: [],
          initiation: null,
          caseFileNumber: "",
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
        <CaseFileForm
          isEditMode={false}
          projectList={mockProjects}
          initiationList={mockInitiations}
          staffUsersList={mockStaffUsers}
        />
      </Wrapper>
    );
  };

  beforeEach(() => {
    setup();
  });

  it("renders the form with all fields", () => {
    // Verify that all labels exist
    cy.contains("General Information").should("exist");
    cy.contains("Project").should("exist");
    cy.contains("Date Created").should("exist");
    cy.contains("Lead Officer (optional)").should("exist");
    cy.contains("Other Assigned Officers (optional)").should("exist");
    cy.contains("Initiation").should("exist");
    cy.contains("Case File Number").should("exist");
  });

  it("allows selecting a project", () => {
    cy.get('input[name="project"]').click();
    cy.get("li").contains("Project Alpha").click();
    cy.get('input[name="project"]').should("have.value", "Project Alpha");
  });

  it("allows selecting a date", () => {
    const day = "15";
    cy.get('button[aria-label="Choose date"]').click();
    cy.get(".MuiPickersDay-root").contains(day).click();
    cy.get('input[name="dateCreated"]').should("contain.value", day);
  });

  it("allows selecting lead officer", () => {
    cy.get('input[name="leadOfficer"]').click();
    cy.get("li").contains("John Doe").click();
    cy.get('input[name="leadOfficer"]').should("have.value", "John Doe");
  });

  it("allows selecting multiple officers", () => {
    cy.get('input[name="officers"]').click();
    cy.get("li").contains("John Doe").click();
    cy.get("li").contains("Jane Smith").click();

    cy.get('.MuiAutocomplete-root[name="officers"]').within(() => {
      cy.get('.MuiAutocomplete-tag').should("have.length", 2);
      cy.get('.MuiAutocomplete-tag').eq(0).should("contain.text", "John Doe");
      cy.get('.MuiAutocomplete-tag').eq(1).should("contain.text", "Jane Smith");
    });
  });

  it("allows selecting initiation", () => {
    cy.get('input[name="initiation"]').click();
    cy.get("li").contains("Initiation Beta").click();
    cy.get('input[name="initiation"]').should("have.value", "Initiation Beta");
  });

  it("allows entering a case file number", () => {
    cy.get('input[name="caseFileNumber"]').type("CF-12345");
    cy.get('input[name="caseFileNumber"]').should("have.value", "CF-12345");
  });
});
