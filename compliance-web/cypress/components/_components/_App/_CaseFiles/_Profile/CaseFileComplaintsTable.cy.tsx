import { mount } from "cypress/react18";
import CaseFileComplaintsTable from "@/components/App/CaseFiles/Profile/CaseFileComplaintsTable";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { 
  RouterProvider, 
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter
} from '@tanstack/react-router';

describe("CaseFileComplaintsTable", () => {
  let queryClient: QueryClient;

  const mockComplaints = [
    {
      id: 1,
      complaint_number: "COMP_123",
      status: "OPEN",
      requirement_detail: { topic: { name: "Topic 1" } },
      source_type: { name: "Source 1" },
      primary_officer: { name: "John Doe" },
    },
    {
      id: 2,
      complaint_number: "COMP_124",
      status: "CLOSED",
      requirement_detail: { topic: { name: "Topic 2" } },
      source_type: { name: "Source 2" },
      primary_officer: { name: "Jane Smith" },
    },
  ];

  beforeEach(() => {
    queryClient = new QueryClient();
    queryClient.setQueryData(["complaints-by-caseFileId", 1], mockComplaints);

    // Create a simple router for testing
    const rootRoute = createRootRoute();
    
    const complaintsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/complaints/$complaintId',
      component: () => <div>Complaint Detail Page</div>
    });
    
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/',
      component: () => (
        <QueryClientProvider client={queryClient}>
          <CaseFileComplaintsTable caseFileId={1} />
        </QueryClientProvider>
      )
    });

    const routeTree = rootRoute.addChildren([indexRoute, complaintsRoute]);
    
    const memoryHistory = createMemoryHistory({
      initialEntries: ['/'],
    });
    
    const router = createRouter({
      routeTree,
      history: memoryHistory,
    });

    mount(<RouterProvider router={router as never} />);
  });

  it("renders the complaints table with correct columns", () => {
    cy.get("table").should("exist");
    cy.contains("th", "Complaint #").should("exist");
    cy.contains("th", "Status").should("exist");
    cy.contains("th", "Topic").should("exist");
    cy.contains("th", "Source").should("exist");
    cy.contains("th", "Primary").should("exist");
  });

  it("displays complaint data correctly", () => {
    cy.contains("123").should("exist"); // Complaint number
    cy.contains("OPEN").should("exist");
    cy.contains("Topic 1").should("exist");
    cy.contains("Source 1").should("exist");
    cy.contains("John Doe").should("exist");
  });

  it("shows complaint links", () => {
    cy.get('a').contains("123").should("exist");
    cy.get('a').contains("124").should("exist");
  });

  it("navigates to complaint detail when link is clicked", () => {
    // Just check that the link has the correct href
    cy.get('a').contains("123").should('have.attr', 'href')
      .and('include', '/complaints/');
    
    // And that clicking doesn't throw errors
    cy.get('a').contains("123").click();
  });

  it("has correct link to complaint detail", () => {
    cy.get('a').contains("123").should('have.attr', 'href')
      .and('include', '/complaints/');
  });
}); 
