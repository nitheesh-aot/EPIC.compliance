import { mount } from "cypress/react18";
import CaseFileCreateComplaint from "@/components/App/CaseFiles/Profile/CaseFileCreateComplaint";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

describe("CaseFileCreateComplaint", () => {
  let queryClient: QueryClient;

  const mockCaseFile = {
    id: 1,
    case_file_number: "CF-123",
    project: { id: 1, name: "Test Project" },
    // ... other required properties
  };

  beforeEach(() => {
    queryClient = new QueryClient();
    queryClient.setQueryData(["case-file", "CF-123"], mockCaseFile);
  });

  const mountComponent = (disabled = false) => {
    mount(
      <QueryClientProvider client={queryClient}>
        <CaseFileCreateComplaint fileNumber="CF-123" disabled={disabled} />
      </QueryClientProvider>
    );
  };

  it("renders create complaint button", () => {
    mountComponent();
    cy.contains("button", "Complaint").should("exist");
    cy.get('button').find('svg').should("exist"); // Check for icon
  });

  it("disables button when disabled prop is true", () => {
    mountComponent(true);
    cy.contains("button", "Complaint").should("be.disabled");
  });

  it("enables button when disabled prop is false", () => {
    mountComponent(false);
    cy.contains("button", "Complaint").should("not.be.disabled");
  });
}); 
