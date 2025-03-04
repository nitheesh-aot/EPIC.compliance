import { mount } from "cypress/react18";
import CaseFileInspectionsTable from "@/components/App/CaseFiles/Profile/CaseFileInspectionsTable";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { 
  RouterProvider, 
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter
} from '@tanstack/react-router';

describe("CaseFileInspectionsTable", () => {
  let queryClient: QueryClient;

  const mockInspections = [
    {
      id: 1,
      ir_number: "IR_123",
      inspection_status: "OPEN",
      subtopic: "Subtopic 1",
      source: "Source 1",
      enforcement: "Warning",
      primary_officer: { name: "John Doe" },
    },
    {
      id: 2,
      ir_number: "IR_124",
      inspection_status: "CLOSED",
      subtopic: "Subtopic 2",
      source: "Source 2",
      enforcement: "Fine",
      primary_officer: { name: "Jane Smith" },
    },
  ];

  beforeEach(() => {
    queryClient = new QueryClient();
    queryClient.setQueryData(["inspections-by-caseFileId", 1], mockInspections);

    // Create a simple router for testing
    const rootRoute = createRootRoute();
    
    const inspectionsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/inspections/$inspectionId',
      component: () => <div>Inspection Detail Page</div>
    });
    
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/',
      component: () => (
        <QueryClientProvider client={queryClient}>
          <CaseFileInspectionsTable caseFileId={1} />
        </QueryClientProvider>
      )
    });

    const routeTree = rootRoute.addChildren([indexRoute, inspectionsRoute]);
    
    const memoryHistory = createMemoryHistory({
      initialEntries: ['/'],
    });
    
    const router = createRouter({
      routeTree,
      history: memoryHistory,
    });

    mount(<RouterProvider router={router as never} />);
  });

  it("renders the inspections table with correct columns", () => {
    cy.get("table").should("exist");
    cy.contains("th", "IR #").should("exist");
    cy.contains("th", "Status").should("exist");
    cy.contains("th", "Subtopic").should("exist");
    cy.contains("th", "Source").should("exist");
    cy.contains("th", "Enforcement").should("exist");
    cy.contains("th", "Primary").should("exist");
  });

  it("displays inspection data correctly", () => {
    cy.contains("123").should("exist"); // IR number
    cy.contains("OPEN").should("exist");
    cy.contains("Subtopic 1").should("exist");
    cy.contains("Source 1").should("exist");
    cy.contains("Warning").should("exist");
    cy.contains("John Doe").should("exist");
  });

  it("shows inspection links", () => {
    cy.get('a').contains("123").should("exist");
    cy.get('a').contains("124").should("exist");
  });

  it("has correct link to inspection detail", () => {
    cy.get('a').contains("123").should('have.attr', 'href')
      .and('include', '/inspections/');
  });
}); 
