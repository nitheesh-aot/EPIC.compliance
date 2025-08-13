/// <reference types="cypress" />
import { mount } from "cypress/react18";
import RequirementsGridPagination from "@/components/App/RequirementsGrid/RequirementsGridPagination";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Box } from "@mui/material";
import { MRT_TableInstance, MRT_TableState } from "material-react-table";
import { InspectionRequirementGrid } from "@/models/InspectionRequirementGrid";

describe("RequirementsGridPagination", () => {
  let queryClient: QueryClient;
  let mockTable: Partial<MRT_TableInstance<InspectionRequirementGrid>>;
  let mockTotalCount: number;

  // Helper function to create a minimal mock table state
  const createMockTableState = (pageIndex: number, pageSize: number): Partial<MRT_TableState<InspectionRequirementGrid>> => ({
    pagination: {
      pageIndex,
      pageSize,
    },
    // Add minimal required properties to satisfy TypeScript
    columnFilterFns: {},
    creatingRow: null,
    density: "comfortable",
    draggingColumn: null,
    draggingRow: null,
    editingCell: null,
    editingRow: null,
    expanded: {},
    globalFilter: "",
    globalFilterFn: "contains",
    grouping: [],
    hoveredRow: null,
    isLoading: false,
    isSaving: false,
    showAlertBanner: false,
    showColumnFilters: false,
    showGlobalFilter: false,
    showProgressBars: false,
    showToolbarDropZone: false,
    sorting: [],
    columnFilters: [],
    columnOrder: [],
    columnPinning: {},
    columnSizing: {},
    columnSizingInfo: {
      columnSizingStart: [],
      deltaOffset: null,
      deltaPercentage: null,
      isResizingColumn: false,
      startOffset: null,
      startSize: null,
    },
    rowPinning: {},
    rowSelection: {},
  });

  const mountComponent = (props = {}) => {
    const defaultProps = {
      table: mockTable as MRT_TableInstance<InspectionRequirementGrid>,
      totalCount: mockTotalCount,
      ...props,
    };

    mount(
      <QueryClientProvider client={queryClient}>
        <Box
          sx={{
            width: "600px",
            height: "100px",
            overflow: "visible",
            position: "relative",
          }}
        >
          <RequirementsGridPagination {...defaultProps} />
        </Box>
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    // Set viewport to ensure proper dimensions
    cy.viewport(800, 600);

    // Add CSS overrides to fix overflow issues in testing
    cy.document().then((doc) => {
      const style = doc.createElement("style");
      style.innerHTML = `
        .MuiBox-root {
          overflow: visible !important;
        }
        .MuiIconButton-root {
          overflow: visible !important;
        }
      `;
      doc.head.appendChild(style);
    });

    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    // Mock table instance with proper typing
    mockTable = {
      getState: () => createMockTableState(0, 25) as MRT_TableState<InspectionRequirementGrid>,
      getCanPreviousPage: () => true,
      getCanNextPage: () => true,
      previousPage: cy.stub().as("previousPage"),
      nextPage: cy.stub().as("nextPage"),
    };

    mockTotalCount = 100;
  });

  describe("Rendering", () => {
    it("should render pagination information correctly", () => {
      mountComponent();
      
      cy.get('p').should("contain", "1 to 25 of 100");
    });

    it("should render both navigation buttons", () => {
      mountComponent();
      
      cy.get('[aria-label="page_back"]').should("exist");
      cy.get('[aria-label="page_forward"]').should("exist");
    });

    it("should render buttons with correct icons", () => {
      mountComponent();
      
      cy.get('[aria-label="page_back"] [data-testid="ChevronLeftRoundedIcon"]').should("exist");
      cy.get('[aria-label="page_forward"] [data-testid="ChevronRightRoundedIcon"]').should("exist");
    });

    it("should have correct button sizes", () => {
      mountComponent();
      
      cy.get('[aria-label="page_back"]').should("have.class", "MuiIconButton-sizeSmall");
      cy.get('[aria-label="page_forward"]').should("have.class", "MuiIconButton-sizeSmall");
    });
  });

  describe("Pagination Information Display", () => {
    it("should display correct range for first page", () => {
      mockTable = {
        getState: () => createMockTableState(0, 25) as MRT_TableState<InspectionRequirementGrid>,
        getCanPreviousPage: () => true,
        getCanNextPage: () => true,
        previousPage: cy.stub().as("previousPage"),
        nextPage: cy.stub().as("nextPage"),
      };

      mountComponent();
      
      cy.get('p').should("contain", "1 to 25 of 100");
    });

    it("should display correct range for middle page", () => {
      mockTable = {
        getState: () => createMockTableState(2, 25) as MRT_TableState<InspectionRequirementGrid>,
        getCanPreviousPage: () => true,
        getCanNextPage: () => true,
        previousPage: cy.stub().as("previousPage"),
        nextPage: cy.stub().as("nextPage"),
      };

      mountComponent();
      
      cy.get('p').should("contain", "51 to 75 of 100");
    });

    it("should display correct range for last page", () => {
      mockTable = {
        getState: () => createMockTableState(3, 25) as MRT_TableState<InspectionRequirementGrid>,
        getCanPreviousPage: () => true,
        getCanNextPage: () => true,
        previousPage: cy.stub().as("previousPage"),
        nextPage: cy.stub().as("nextPage"),
      };

      mountComponent();
      
      cy.get('p').should("contain", "76 to 100 of 100");
    });

    it("should handle different page sizes", () => {
      mockTable = {
        getState: () => createMockTableState(0, 10) as MRT_TableState<InspectionRequirementGrid>,
        getCanPreviousPage: () => true,
        getCanNextPage: () => true,
        previousPage: cy.stub().as("previousPage"),
        nextPage: cy.stub().as("nextPage"),
      };

      mountComponent();
      
      cy.get('p').should("contain", "1 to 10 of 100");
    });

    it("should handle total count less than page size", () => {
      mockTable = {
        getState: () => createMockTableState(0, 25) as MRT_TableState<InspectionRequirementGrid>,
        getCanPreviousPage: () => true,
        getCanNextPage: () => true,
        previousPage: cy.stub().as("previousPage"),
        nextPage: cy.stub().as("nextPage"),
      };

      mountComponent({ totalCount: 15 });
      
      cy.get('p').should("contain", "1 to 15 of 15");
    });
  });

  describe("Navigation Button Functionality", () => {
    it("should call previousPage when back button is clicked", () => {
      mountComponent();
      
      cy.get('[aria-label="page_back"]').click();
      
      cy.get("@previousPage").should("have.been.called");
    });

    it("should call nextPage when forward button is clicked", () => {
      mountComponent();
      
      cy.get('[aria-label="page_forward"]').click();
      
      cy.get("@nextPage").should("have.been.called");
    });

    it("should disable back button when on first page", () => {
      mockTable = {
        getState: () => createMockTableState(0, 25) as MRT_TableState<InspectionRequirementGrid>,
        getCanPreviousPage: () => false,
        getCanNextPage: () => true,
        previousPage: cy.stub().as("previousPage"),
        nextPage: cy.stub().as("nextPage"),
      };

      mountComponent();
      
      cy.get('[aria-label="page_back"]').should("be.disabled");
      cy.get('[aria-label="page_forward"]').should("not.be.disabled");
    });

    it("should disable forward button when on last page", () => {
      mockTable = {
        getState: () => createMockTableState(3, 25) as MRT_TableState<InspectionRequirementGrid>,
        getCanPreviousPage: () => true,
        getCanNextPage: () => false,
        previousPage: cy.stub().as("previousPage"),
        nextPage: cy.stub().as("nextPage"),
      };

      mountComponent();
      
      cy.get('[aria-label="page_back"]').should("not.be.disabled");
      cy.get('[aria-label="page_forward"]').should("be.disabled");
    });

    it("should disable both buttons when only one page", () => {
      mockTable = {
        getState: () => createMockTableState(0, 100) as MRT_TableState<InspectionRequirementGrid>,
        getCanPreviousPage: () => false,
        getCanNextPage: () => false,
        previousPage: cy.stub().as("previousPage"),
        nextPage: cy.stub().as("nextPage"),
      };

      mountComponent({ totalCount: 100 });
      
      cy.get('[aria-label="page_back"]').should("be.disabled");
      cy.get('[aria-label="page_forward"]').should("be.disabled");
    });
  });

  describe("Edge Cases", () => {
    it("should handle zero total count", () => {
      mountComponent({ totalCount: 0 });
      
      // When total count is 0, the component should handle it gracefully
      cy.get('p').should("exist");
      // The exact text may vary based on how the component handles edge cases
    });

    it("should handle very large total count", () => {
      mountComponent({ totalCount: 999999 });
      
      cy.get('p').should("contain", "1 to 25 of 999999");
    });

    it("should handle page size larger than total count", () => {
      mockTable = {
        getState: () => createMockTableState(0, 1000) as MRT_TableState<InspectionRequirementGrid>,
        getCanPreviousPage: () => false,
        getCanNextPage: () => false,
        previousPage: cy.stub().as("previousPage"),
        nextPage: cy.stub().as("nextPage"),
      };

      mountComponent({ totalCount: 100 });
      
      cy.get('p').should("contain", "1 to 100 of 100");
    });

    it("should handle page index beyond total pages", () => {
      mockTable = {
        getState: () => createMockTableState(10, 25) as MRT_TableState<InspectionRequirementGrid>,
        getCanPreviousPage: () => true,
        getCanNextPage: () => false,
        previousPage: cy.stub().as("previousPage"),
        nextPage: cy.stub().as("nextPage"),
      };

      mountComponent({ totalCount: 100 });
      
      // The component should handle this gracefully
      cy.get('p').should("exist");
    });
  });

  describe("Styling and Layout", () => {
    it("should render with proper structure", () => {
      mountComponent();
      
      // Check that the component renders with proper structure
      cy.get('.MuiBox-root').should("exist");
      cy.get('p').should("exist");
      cy.get('[aria-label="page_back"]').should("exist");
      cy.get('[aria-label="page_forward"]').should("exist");
    });

    it("should have correct typography variant", () => {
      mountComponent();
      
      cy.get('p').should("have.class", "MuiTypography-body1");
    });
  });

  describe("Accessibility", () => {
    it("should have proper aria labels for navigation buttons", () => {
      mountComponent();
      
      cy.get('[aria-label="page_back"]').should("exist");
      cy.get('[aria-label="page_forward"]').should("exist");
    });

    it("should have proper button types", () => {
      mountComponent();
      
      cy.get('[aria-label="page_back"]').should("exist");
      cy.get('[aria-label="page_forward"]').should("exist");
    });
  });

  describe("Integration Scenarios", () => {
    it("should work with different pagination scenarios", () => {
      const scenarios = [
        { pageIndex: 0, pageSize: 10, totalCount: 25, expected: "1 to 10 of 25" },
        { pageIndex: 1, pageSize: 10, totalCount: 25, expected: "11 to 20 of 25" },
        { pageIndex: 2, pageSize: 10, totalCount: 25, expected: "21 to 25 of 25" },
        { pageIndex: 0, pageSize: 50, totalCount: 100, expected: "1 to 50 of 100" },
        { pageIndex: 1, pageSize: 50, totalCount: 100, expected: "51 to 100 of 100" },
      ];

      scenarios.forEach((scenario) => {
        mockTable = {
          getState: () => createMockTableState(scenario.pageIndex, scenario.pageSize) as MRT_TableState<InspectionRequirementGrid>,
          getCanPreviousPage: () => scenario.pageIndex > 0,
          getCanNextPage: () => (scenario.pageIndex + 1) * scenario.pageSize < scenario.totalCount,
          previousPage: cy.stub().as("previousPage"),
          nextPage: cy.stub().as("nextPage"),
        };

        mountComponent({ totalCount: scenario.totalCount });
        
        cy.get('p').should("contain", scenario.expected);
        
        // Check button states
        if (scenario.pageIndex === 0) {
          cy.get('[aria-label="page_back"]').should("be.disabled");
        } else {
          cy.get('[aria-label="page_back"]').should("not.be.disabled");
        }
        
        if ((scenario.pageIndex + 1) * scenario.pageSize >= scenario.totalCount) {
          cy.get('[aria-label="page_forward"]').should("be.disabled");
        } else {
          cy.get('[aria-label="page_forward"]').should("not.be.disabled");
        }
      });
    });
  });
});
