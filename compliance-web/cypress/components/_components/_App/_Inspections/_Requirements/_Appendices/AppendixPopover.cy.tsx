import AppendixPopover from "@/components/App/Inspections/Profile/Requirements/Appendices/AppendixPopover";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

describe("AppendixPopover", () => {
  const queryClient = new QueryClient();
  let onSubmitSpy: Cypress.Agent<sinon.SinonSpy>;
  const inspectionId = 123;

  beforeEach(() => {
    // Reset the query client before each test
    queryClient.clear();
    onSubmitSpy = cy.spy().as("onSubmitSpy");
  });

  it("renders add appendix form correctly", () => {
    cy.mount(
      <QueryClientProvider client={queryClient}>
        <AppendixPopover onSubmit={onSubmitSpy} inspectionId={inspectionId} />
      </QueryClientProvider>
    );

    cy.get('label[for="appendixNumber"]').should("exist");
    cy.get('label[for="documentTitle"]').should("exist");
    cy.contains("Add").should("exist");
    cy.contains("Delete").should("not.exist");
  });

  it("renders edit appendix form correctly", () => {
    const appendixData = {
      id: 1,
      appendix_no: "1",
      document_title: "Test Document",
      inspection_id: inspectionId,
    };

    cy.mount(
      <QueryClientProvider client={queryClient}>
        <AppendixPopover
          onSubmit={onSubmitSpy}
          inspectionId={inspectionId}
          appendixData={appendixData}
        />
      </QueryClientProvider>
    );

    cy.get('input[name="appendixNumber"]').should("have.value", "1");
    cy.get('textarea[name="documentTitle"]').should(
      "have.value",
      "Test Document"
    );
    cy.contains("Save").should("exist");
    cy.contains("Delete").should("exist");
  });

  it("shows validation errors for required fields", () => {
    cy.mount(
      <QueryClientProvider client={queryClient}>
        <AppendixPopover onSubmit={onSubmitSpy} inspectionId={inspectionId} />
      </QueryClientProvider>
    );

    // Submit empty form
    cy.get('button[type="submit"]').click();

    // Check for validation messages
    cy.contains("Appendix Number is required").should("exist");
    cy.contains("Document Title is required").should("exist");
  });

  it("submits form with valid data", () => {
    cy.mount(
      <QueryClientProvider client={queryClient}>
        <AppendixPopover onSubmit={onSubmitSpy} inspectionId={inspectionId} />
      </QueryClientProvider>
    );

    // Fill in form
    cy.get('input[name="appendixNumber"]').type("A1");
    cy.get('textarea[name="documentTitle"]').type("Test Document");

    // Submit form
    cy.get("[data-testid='primary-action-popover-button']").click();
  });

  it("deletes appendix when delete is confirmed", () => {
    const appendixData = {
      id: 1,
      appendix_no: "A1",
      document_title: "Test Document",
      inspection_id: inspectionId,
    };

    cy.mount(
      <QueryClientProvider client={queryClient}>
        <AppendixPopover
          onSubmit={onSubmitSpy}
          inspectionId={inspectionId}
          appendixData={appendixData}
        />
      </QueryClientProvider>
    );

    // Click delete and confirm
    cy.contains("Delete").click();
    cy.contains("Delete Appendix?").should("exist");
    cy.get("[data-testid='delete-confirmation-button']").click();
  });
});
