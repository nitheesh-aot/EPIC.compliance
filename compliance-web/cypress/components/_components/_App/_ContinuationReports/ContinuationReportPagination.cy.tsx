import ContinuationReportPagination from "@/components/App/ContinuationReports/ContinuationReportPagination";

describe("ContinuationReportPagination.cy.tsx", () => {
  const defaultProps = {
    page: 1,
    rowsPerPage: 10,
    total: 25,
  };

  beforeEach(() => {
    const onPageChange = cy.stub().as("onPageChange");
    const onRowsPerPageChange = cy.stub().as("onRowsPerPageChange");
    
    cy.mount(
      <ContinuationReportPagination 
        {...defaultProps} 
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
      />
    );
  });

  it("displays correct pagination range", () => {
    cy.contains("1 - 10").should("exist");
    cy.contains("of 25").should("exist");
  });

  it("shows correct number of pages", () => {
    // With 25 total items and 10 per page, we should have 3 pages
    cy.get(".MuiPagination-ul").find("li").should("have.length", 7); // Including first/last buttons
  });

  it("allows changing rows per page", () => {
    cy.get(".MuiSelect-select").click();
    cy.contains("20 per page").click();
    cy.get("@onRowsPerPageChange").should("have.been.called");
  });

  it("updates display when page changes", () => {
    const onPageChange = cy.stub().as("onPageChange");
    const onRowsPerPageChange = cy.stub().as("onRowsPerPageChange");
    
    cy.mount(
      <ContinuationReportPagination
        {...defaultProps}
        page={2}
        rowsPerPage={10}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
      />
    );
    cy.contains("11 - 20").should("exist");
  });
}); 
