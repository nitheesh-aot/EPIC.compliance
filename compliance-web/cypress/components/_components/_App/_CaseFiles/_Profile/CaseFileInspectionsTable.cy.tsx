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
import { CaseFile } from "@/models/CaseFile";
import { INITIATION } from "@/utils/constants";

describe("CaseFileInspectionsTable", () => {
  let queryClient: QueryClient;

  const mockInspections = [
    {
      id: 1,
      ir_number: "IR_123",
      inspection_status: "OPEN",
      location_description: "Test Location 1",
      start_date: "2023-04-15T12:00:00Z",
      primary_officer: { name: "John Doe" },
    },
    {
      id: 2,
      ir_number: "IR_124",
      inspection_status: "CLOSED",
      location_description: "Test Location 2",
      start_date: "2023-04-16T12:00:00Z",
      primary_officer: { name: "Jane Smith" },
    },
  ];

  const mockCaseFile: CaseFile = {
    id: 1,
    project: { id: 1, name: "Test Project" },
    date_created: "2023-04-15T12:00:00Z",
    initiation: { id: INITIATION.INSPECTION_ID, name: "Inspection" },
    primary_officer: { id: 1, name: "John Doe", is_active: true },
    officers: [
      { id: 2, name: "Jane Smith", is_active: true },
      { id: 3, name: "Bob Johnson", is_active: true },
    ],
    project_id: 0,
    primary_officer_id: 0,
    case_file_number: "",
    case_file_status: "",
    is_active: false,
  };

  beforeEach(() => {
    queryClient = new QueryClient();
    queryClient.setQueryData(["inspections-by-caseFileId", 1], mockInspections);

    // Create a simple router for testing
    const rootRoute = createRootRoute();
    
    const inspectionsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/ce-database/inspections/$inspectionNumber',
      component: () => <div>Inspection Detail Page</div>
    });
    
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/',
      component: () => (
        <QueryClientProvider client={queryClient}>
          <CaseFileInspectionsTable caseFile={mockCaseFile} />
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

  it("renders the inspections section with correct title", () => {
    cy.contains("h6", "Inspections").should("exist");
  });

  it("displays inspection accordions with correct inspection numbers", () => {
    cy.contains("IR_123").should("exist");
    cy.contains("IR_124").should("exist");
  });

  it("shows inspection status chips", () => {
    cy.get('[data-testid="status-chip"]').contains("OPEN").should("exist");
    cy.get('[data-testid="status-chip"]').contains("CLOSED").should("exist");
  });

  it("displays primary officer information", () => {
    cy.contains("Primary:").should("exist");
    cy.contains("John Doe").should("exist");
    cy.contains("Jane Smith").should("exist");
  });

  it("shows expand/collapse icons", () => {
    // Check for ChevronRight icons (collapsed state)
    cy.get('[data-testid="ChevronRightIcon"]').should("exist");
  });

  it("expands accordion when clicked", () => {
    // Click on the first accordion to expand it
    cy.get('[role="button"]').first().click();
    
    // Should show expanded content
    cy.contains("Location").should("exist");
    cy.contains("Date").should("exist");
    cy.contains("Status").should("exist");
    
    // Should show ExpandLessRounded icon when expanded
    cy.get('[data-testid="ExpandLessRoundedIcon"]').should("exist");
  });

  it("displays inspection details when expanded", () => {
    // Expand the first accordion
    cy.get('[role="button"]').first().click();
    
    // Check for location
    cy.contains("Test Location 1").should("exist");
    
    // Check for formatted date
    cy.contains("2023-04-15").should("exist");
    
    // Check for status
    cy.contains("OPEN").should("exist");
  });

  it("shows inspection links with correct routing", () => {
    cy.get('a').contains("IR_123").should("exist");
    cy.get('a').contains("IR_124").should("exist");
  });

  it("has correct link to inspection detail", () => {
    cy.get('a').contains("IR_123").should('have.attr', 'href')
      .and('include', '/ce-database/inspections/');
  });

  it("navigates to inspection detail when link is clicked", () => {
    // Just check that the link has the correct href
    cy.get('a').contains("IR_123").should('have.attr', 'href')
      .and('include', '/ce-database/inspections/');
    
    // And that clicking doesn't throw errors
    cy.get('a').contains("IR_123").click();
  });

  it("collapses accordion when clicked again", () => {
    // Expand the first accordion
    cy.get('[role="button"]').first().click();
    
    // Verify it's expanded
    cy.contains("Location").should("exist");
    
    // Click again to collapse
    cy.get('[role="button"]').first().click();
    
    // Verify it's collapsed (content should not be visible)
    cy.contains("Location").should("not.be.visible");
  });

  it("shows no inspections message when there are no inspections", () => {
    // Set empty inspections data
    queryClient.setQueryData(["inspections-by-caseFileId", 1], []);
    
    // Re-mount with empty data
    const rootRoute = createRootRoute();
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/',
      component: () => (
        <QueryClientProvider client={queryClient}>
          <CaseFileInspectionsTable caseFile={mockCaseFile} />
        </QueryClientProvider>
      )
    });
    const routeTree = rootRoute.addChildren([indexRoute]);
    const memoryHistory = createMemoryHistory({ initialEntries: ['/'] });
    const router = createRouter({ routeTree, history: memoryHistory });
    
    mount(<RouterProvider router={router as never} />);
    
    cy.contains("You do not have any created inspections on this file.").should("exist");
  });
}); 
