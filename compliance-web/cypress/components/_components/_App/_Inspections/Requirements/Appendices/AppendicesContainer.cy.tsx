import AppendicesContainer from "@/components/App/Inspections/Profile/Requirements/Appendices/AppendicesContainer";
import PopoverProvider from "@/components/Shared/Popover/PopoverProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRequirementStore } from "@/components/App/Inspections/Profile/Requirements/requirementStore";

const mockAppendices = [
  {
    id: 1,
    inspection_id: 123,
    appendix_no: "A",
    document_title: "Test Appendix 1",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    inspection_id: 123,
    appendix_no: "B",
    document_title: "Test Appendix 2",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

describe("AppendicesContainer", () => {
  const inspectionId = 123;
  const queryClient = new QueryClient();

  beforeEach(() => {
    // Reset store before each test
    useRequirementStore.getState().reset();
  });

  function mountAppendicesContainer(): React.ReactNode {
    return (
      <QueryClientProvider client={queryClient}>
        <PopoverProvider />
        <AppendicesContainer inspectionId={inspectionId} />
      </QueryClientProvider>
    );
  }

  beforeEach(() => {
    // Intercept API calls
    cy.intercept("GET", `/appendices?inspection_id=${inspectionId}`, {
      statusCode: 200,
      body: mockAppendices,
    }).as("getAppendices");
  });

  it("renders empty state correctly", () => {
    cy.intercept("GET", `/appendices?inspection_id=${inspectionId}`, {
      statusCode: 200,
      body: [],
    }).as("getEmptyAppendices");

    cy.mount(mountAppendicesContainer());

    // Check accordion is present and closed
    cy.get("[aria-controls='panel-appendices-content']").should("exist");
    cy.get(".MuiAccordionSummary-content").contains("Appendices");

    // Open accordion
    cy.get("[aria-controls='panel-appendices-content']").click();

    // Check empty state message
    cy.contains("No Appendices added yet").should("be.visible");
    cy.contains("New Appendix").should("be.visible");
  });

  it("renders list of appendices correctly", () => {
    // Set mock data in store
    useRequirementStore.getState().setAppendices(mockAppendices);
    
    cy.mount(mountAppendicesContainer());

    // Open accordion
    cy.get("[aria-controls='panel-appendices-content']").click();

    // Check if appendices are rendered
    cy.contains("List of Appendices:").should("be.visible");
    mockAppendices.forEach((appendix) => {
      cy.contains(appendix.document_title).should("be.visible");
      cy.contains(appendix.appendix_no).should("be.visible");
    });
  });

  it("opens popover when adding new appendix", () => {
    cy.mount(mountAppendicesContainer());
    // Open accordion
    cy.get("[aria-controls='panel-appendices-content']").click();
    // Click new appendix button
    cy.contains("New Appendix").click();
    // Check if popover is opened
    cy.get("[role='presentation']").should("exist");
    cy.contains("Cancel").click();
  });

  it("opens popover with data when editing existing appendix", () => {
    useRequirementStore.getState().setAppendices(mockAppendices);
    cy.mount(mountAppendicesContainer());
    // Open accordion
    cy.get("[aria-controls='panel-appendices-content']").click();
    // Click on first appendix
    cy.contains(mockAppendices[0].document_title).click();
    // Check if popover is opened with existing data
    cy.get("[role='presentation']").should("exist");
    cy.contains("Cancel").click();
  });
});
