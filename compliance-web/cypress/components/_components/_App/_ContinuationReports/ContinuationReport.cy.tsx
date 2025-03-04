import ContinuationReport from "@/components/App/ContinuationReports/ContinuationReport";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

describe("ContinuationReport.cy.tsx", () => {
  const queryClient = new QueryClient();

  const defaultProps = {
    caseFileId: 123,
    contextType: "INSPECTION",
    contextId: 456,
    allowCreateEntry: true,
    isInspection: false,
  };

  beforeEach(() => {
    cy.mount(
      <QueryClientProvider client={queryClient}>
        <ContinuationReport {...defaultProps} />
      </QueryClientProvider>
    );
  });

  it("renders the component title", () => {
    cy.contains("Continuation Report").should("exist");
  });

  it("shows New Entry button when allowCreateEntry is true", () => {
    cy.contains("New Entry").should("exist");
  });

  it("hides New Entry button when allowCreateEntry is false", () => {
    cy.mount(
      <QueryClientProvider client={queryClient}>
        <ContinuationReport {...defaultProps} allowCreateEntry={false} />
      </QueryClientProvider>
    );
    cy.contains("New Entry").should("not.exist");
  });

  it("shows search field and allows searching", () => {
    cy.get("#searchTextField").should("exist");
    cy.get("#searchTextField").type("test search");
    cy.get("#searchTextField").should("have.value", "test search");
  });

  it("shows clear button when search has text", () => {
    cy.get("#searchTextField").type("test");
    cy.get("[data-testid='CloseRoundedIcon']").should("exist").click();
    cy.get("#searchTextField").should("have.value", "");
  });
}); 
