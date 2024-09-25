/// <reference types="cypress" />
import { mount } from "cypress/react18";
import StaffForm from "@/components/App/Staff/StaffForm"; // Adjust the path according to your project structure
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FormProvider, useForm } from "react-hook-form";

// Mock data for Auth Users, Positions, Permissions, and Staff Users
const mockAuthUsers = [
  { id: 1, first_name: "John", last_name: "Doe" },
  { id: 2, first_name: "Jane", last_name: "Smith" },
];

const mockPositions = [
  { id: 1, name: "Manager" },
  { id: 2, name: "Developer" },
];

const mockPermissions = [
  { id: 1, name: "Admin" },
  { id: 2, name: "User" },
];

const mockStaffUsers = [
  { id: 1, full_name: "Alice Johnson" },
  { id: 2, full_name: "Bob Brown" },
];

describe("StaffForm Component", () => {
  const setup = (existingStaff = undefined) => {
    const queryClient = new QueryClient();

    // Create a wrapper component to provide react-hook-form context
    const Wrapper = ({ children }: { children: React.ReactNode }) => {
      const methods = useForm({
        defaultValues: {
          name: existingStaff ? `${existingStaff.full_name}` : "",
          position: null,
          deputyDirector: null,
          supervisor: null,
          permission: null,
        },
      });

      return (
        <QueryClientProvider client={queryClient}>
          <FormProvider {...methods}>{children}</FormProvider>
        </QueryClientProvider>
      );
    };

    mount(
      <Wrapper>
        <StaffForm
          existingStaff={existingStaff}
          authUsersList={mockAuthUsers}
          positionsList={mockPositions}
          permissionsList={mockPermissions}
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
    cy.contains("Name").should("exist");
    cy.contains("Position").should("exist");
    cy.contains("Deputy Director").should("exist");
    cy.contains("Supervisor").should("exist");
    cy.contains("Permission").should("exist");
  });

  it("allows selecting an auth user name", () => {
    cy.get('input[name="name"]').click();
    cy.get("li").contains("John Doe").click();
    cy.get('input[name="name"]').should("have.value", "John Doe");
  });

  it("disables the 'Name' field if existingStaff is provided", () => {
    setup({ id: 3, full_name: "Existing Staff User" });
    cy.get('input[name="name"]').should("be.disabled");
  });

  it("allows selecting a position", () => {
    cy.get('input[name="position"]').click();
    cy.get("li").contains("Manager").click();
    cy.get('input[name="position"]').should("have.value", "Manager");
  });

  it("allows selecting a deputy director", () => {
    cy.get('input[name="deputyDirector"]').click();
    cy.get("li").contains("Alice Johnson").click();
    cy.get('input[name="deputyDirector"]').should("have.value", "Alice Johnson");
  });

  it("allows selecting a supervisor", () => {
    cy.get('input[name="supervisor"]').click();
    cy.get("li").contains("Bob Brown").click();
    cy.get('input[name="supervisor"]').should("have.value", "Bob Brown");
  });

  it("allows selecting a permission", () => {
    cy.get('input[name="permission"]').click();
    cy.get("li").contains("Admin").click();
    cy.get('input[name="permission"]').should("have.value", "Admin");
  });
});
