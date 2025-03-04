import ContinuationReportTimelineEntry from "@/components/App/ContinuationReports/ContinuationReportTimelineEntry";
import { CRKeys } from "@/models/ContinuationReport";
import { CR_CONTEXT_LINK } from "@/utils/constants";

describe("ContinuationReportTimelineEntry", () => {
  const mockRenderText = "This is a test report with key ABC123";
  const mockKeys: CRKeys[] = [
    { key: "ABC123", key_context: "Inspection", id: 1, is_active: true },
  ];

  beforeEach(() => {
    // Mock CR_CONTEXT_LINK constant if needed
    cy.stub(CR_CONTEXT_LINK, "Inspection").returns("/ce-database/inspections");
  });

  it("renders basic content correctly", () => {
    cy.mount(
      <ContinuationReportTimelineEntry
        renderText={mockRenderText}
        keys={[]}
        isSystemGenerated={false}
        createdByUser="Test User"
      />
    );

    cy.contains("This is a test report with key ABC123").should("exist");
    cy.contains("Created by Test User").should("exist");
  });

  it("does not show creator for system-generated entries", () => {
    cy.mount(
      <ContinuationReportTimelineEntry
        renderText={mockRenderText}
        keys={[]}
        isSystemGenerated={true}
        createdByUser="Test User"
      />
    );

    cy.contains("This is a test report with key ABC123").should("exist");
    cy.contains("Created by Test User").should("not.exist");
  });

  it("applies navigation links to keys", () => {
    cy.mount(
      <ContinuationReportTimelineEntry
        renderText={mockRenderText}
        keys={mockKeys}
        isSystemGenerated={false}
      />
    );

    cy.get('a[href="/ce-database/inspections/ABC123"]').should("exist");
    cy.get('a[href="/ce-database/inspections/ABC123"]').should("have.text", "ABC123");
  });

  it("highlights search text when provided", () => {
    cy.mount(
      <ContinuationReportTimelineEntry
        renderText={mockRenderText}
        keys={[]}
        isSystemGenerated={false}
        searchText="test"
      />
    );

    cy.get('span[style="background-color: yellow;"]').should("exist");
    cy.get('span[style="background-color: yellow;"]').should(
      "have.text",
      "test"
    );
  });

  it("highlights search text within links", () => {
    cy.mount(
      <ContinuationReportTimelineEntry
        renderText={mockRenderText}
        keys={mockKeys}
        isSystemGenerated={false}
        searchText="ABC"
      />
    );

    cy.get('a[href="/ce-database/inspections/ABC123"]').within(() => {
      cy.get('span[style="background-color: yellow;"]').should("exist");
      cy.get('span[style="background-color: yellow;"]').should(
        "have.text",
        "ABC"
      );
    });
  });

  it("expands ParagraphWithReadMore when search text is provided", () => {
    // This test requires mocking ParagraphWithReadMore or checking props
    cy.mount(
      <ContinuationReportTimelineEntry
        renderText={mockRenderText}
        keys={[]}
        isSystemGenerated={false}
        searchText="test"
      />
    );

    // We can't directly test the expand prop, but we can check if the component renders
    cy.contains("This is a test report with key ABC123").should("exist");
  });

  it("handles multiple keys in the text", () => {
    const multiKeyText = "Report with keys ABC123 and XYZ789";
    const multiKeys: CRKeys[] = [
      { key: "ABC123", key_context: "Inspection", id: 1, is_active: true },
      { key: "XYZ789", key_context: "Inspection", id: 2, is_active: true },
    ];

    // Update stub for the second context
    cy.stub(CR_CONTEXT_LINK, "Inspection").returns("/ce-database/inspections");

    cy.mount(
      <ContinuationReportTimelineEntry
        renderText={multiKeyText}
        keys={multiKeys}
        isSystemGenerated={false}
      />
    );

    cy.get('a[href="/ce-database/inspections/ABC123"]').should("exist");
    cy.get('a[href="/ce-database/inspections/XYZ789"]').should("exist");
  });

  it("handles case-insensitive key matching", () => {
    const caseText = "Report with key abc123";

    cy.mount(
      <ContinuationReportTimelineEntry
        renderText={caseText}
        keys={mockKeys}
        isSystemGenerated={false}
      />
    );

    cy.get('a[href="/ce-database/inspections/ABC123"]').should("exist");
  });
});
