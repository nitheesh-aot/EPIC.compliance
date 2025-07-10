import RequirementSourceCard from "@/components/App/Inspections/Profile/Requirements/RequirementSource/RequirementSourceCard";
import { RequirementSourceFormData } from "@/models/InspectionRequirement";
import { RequirementSourceEnum } from "@/utils/constants";

describe("RequirementSourceCard", () => {
  const mockSourceData: RequirementSourceFormData[] = [
    {
      requirementSource: {
        id: RequirementSourceEnum.EACA,
        name: "Test Source",
      },
      sourceNumber: "1.1",
      title: "Test Title",
      sourceAmendmentNumber: "123",
      description: {
        html: "<p>Test description</p>",
        text: "Test description",
      },
      relatedDocuments: [
        {
          id: 1,
          documentTitle: "Related Doc 1",
          sections: [
            {
              id: 1,
              sectionNumber: "1.1",
              sectionTitle: "Test Section",
              description: {
                html: "<p>Test section description</p>",
                text: "Test section description",
              },
            },
          ],
        },
      ],
    },
  ];

  let mockHandlers;

  beforeEach(() => {
    mockHandlers = {
      onEdit: cy.stub().as("onEdit"),
      onDelete: cy.stub().as("onDelete"),
      onAddSection: cy.stub().as("onAddSection"),
      onAddRelatedDocument: cy.stub().as("onAddRelatedDocument"),
      onAddRelatedDocumentSection: cy.stub().as("onAddRelatedDocumentSection"),
      onEditRelatedDocumentSection: cy
        .stub()
        .as("onEditRelatedDocumentSection"),
      onDeleteRelatedDocumentSection: cy
        .stub()
        .as("onDeleteRelatedDocumentSection"),
    };

    cy.mount(
      <RequirementSourceCard
        data={mockSourceData}
        index={0}
        {...mockHandlers}
      />
    ).then(({ component }) => {
      cy.log("Component Props:", component);
    });
  });

  it("renders the source name and amendment number", () => {
    cy.contains("Test Source #123").should("be.visible");
  });

  it("expands and collapses when clicked", () => {
    // Should be expanded by default (index === 0)
    cy.get(".MuiAccordion-root").should("have.class", "Mui-expanded");

    // Click to collapse
    cy.get(`#requirement-source-panel${0}-header`).click();
    cy.get(".MuiAccordion-root").should("not.have.class", ".Mui-expanded");

    // Click to expand
    cy.get(`#requirement-source-panel${0}-header`).click();
    cy.get(".MuiAccordion-root").should("have.class", "Mui-expanded");
  });

  it("displays source details when expanded", () => {
    cy.contains("Section #:").should("be.visible");
    cy.contains("1.1").should("be.visible");
    cy.contains("Title:").should("be.visible");
    cy.contains("Test Title").should("be.visible");
    cy.contains("Description:").should("be.visible");
    cy.get(".editor-content").should("contain", "Test description");
  });

  it("calls appropriate handlers when buttons are clicked", () => {
    cy.contains("button", "Section").should("exist").click();

    cy.get("@onAddRelatedDocumentSection").should("have.been.calledOnce");

    // cy.get("@onAddSection").should("have.been.calledWith", mockSourceData[0]);

    // Add Related Document button
    cy.get("[data-testid='requirement-source-add-related-document-0']").click();
    cy.get("@onAddRelatedDocument").should(
      "have.been.calledWith",
      mockSourceData[0]
    );

    // Edit button
    cy.get("[data-testid='requirement-source-edit-0']").click();
    cy.get("@onEdit").should("have.been.calledWith", mockSourceData[0]);

    // Delete button
    cy.get("[data-testid='requirement-source-delete-0']").click();
    cy.get("@onDelete").should("have.been.calledWith", mockSourceData[0]);
  });

  it("renders condition instead of section for condition source type", () => {
    const conditionSourceData = [
      {
        ...mockSourceData[0],
        requirementSource: {
          id: "1",
          name: "Test Condition",
        },
      },
    ];

    cy.mount(
      <RequirementSourceCard
        data={conditionSourceData}
        index={0}
        {...mockHandlers}
      />
    );

    cy.contains("button", "Condition").should("be.visible");
    cy.contains("Condition #:").should("be.visible");
  });

  it("renders related documents when present", () => {
    const dataWithRelatedDocs: RequirementSourceFormData[] = [
      {
        ...mockSourceData[0],
        relatedDocuments: [
          {
            id: 1,
            documentTitle: "Related Doc 1",
            sections: [],
          },
        ],
      },
    ];

    cy.mount(
      <RequirementSourceCard
        data={dataWithRelatedDocs}
        index={0}
        {...mockHandlers}
      />
    );

    cy.contains("Related Doc 1").should("be.visible");
  });
});
