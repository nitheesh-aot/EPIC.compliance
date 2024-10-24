/// <reference types="cypress" />
import { mount } from "cypress/react18";
import ComplaintFormLeft from "@/components/App/Complaints/ComplaintFormLeft"; // Adjust the path accordingly
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FormProvider, useForm } from "react-hook-form";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"; // Adjust to your date adapter

// Mock data for projects and staff users
const mockProjects = [
  { id: 1, name: "Project Alpha" },
  { id: 2, name: "Project Beta" },
];

const mockStaffUsers = [
  { id: 1, full_name: "John Doe" },
  { id: 2, full_name: "Jane Smith" },
];

describe("ComplaintFormLeft Component", () => {
  const setup = () => {
    const queryClient = new QueryClient();

    // Create a wrapper component to provide react-hook-form and LocalizationProvider context
    const Wrapper = ({ children }: { children: React.ReactNode }) => {
      const methods = useForm({
        defaultValues: {
          project: null,
          concernDescription: "",
          locationDescription: "",
          primaryOfficer: null,
          dateReceived: null,
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
        <ComplaintFormLeft projectList={mockProjects} staffUsersList={mockStaffUsers} />
      </Wrapper>
    );
  };

  beforeEach(() => {
    setup();
  });

  it("renders the form with all fields", () => {
    // Verify that all labels exist
    cy.contains("Concern Description").should("exist");
    cy.contains("Location Description (optional)").should("exist");
    cy.contains("Primary (optional)").should("exist");
    cy.contains("Date Received").should("exist");
  });

  it("allows selecting a project in ProjectDetailsForm", () => {
    cy.get('input[name="project"]').click();
    cy.get("li").contains("Project Alpha").click();
    cy.get('input[name="project"]').should("have.value", "Project Alpha");
  });

  it("allows entering a concern description", () => {
    cy.get('textarea[name="concernDescription"]').type("Water pollution observed");
    cy.get('textarea[name="concernDescription"]').should("have.value", "Water pollution observed");
  });

  it("allows entering a location description", () => {
    cy.get('textarea[name="locationDescription"]').type("Near the river bank");
    cy.get('textarea[name="locationDescription"]').should("have.value", "Near the river bank");
  });

  it("allows selecting a lead officer", () => {
    cy.get('input[name="primaryOfficer"]').click();
    cy.get("li").contains("John Doe").click();
    cy.get('input[name="primaryOfficer"]').should("have.value", "John Doe");
  });

  it("allows selecting a date received", () => {
    cy.get('button[aria-label="Choose date"]').click();
    cy.get(".MuiPickersDay-root").contains("15").click(); 
    cy.get('input[name="dateReceived"]').should("contain.value", "15");
  });
});
