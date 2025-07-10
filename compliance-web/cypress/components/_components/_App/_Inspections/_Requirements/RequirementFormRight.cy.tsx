import RequirementFormRight from "@/components/App/Inspections/Profile/Requirements/RequirementFormRight";
import ModalProvider from "@/components/Shared/Modals/ModalProvider";
import { RequirementSourceFormData } from "@/models/InspectionRequirement";
import { RequirementSourceEnum } from "@/utils/constants";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const mountComponent = (reqSrcList: RequirementSourceFormData[]) => {
  const mockOnDataChange = cy.stub().as("onDataChange");

  cy.mount(
    <QueryClientProvider client={queryClient}>
      <ModalProvider />
      <RequirementFormRight
        onDataChange={mockOnDataChange}
        requirementSourceFormDataList={reqSrcList}
        inspectionId={1}
        isRequirement={true}
      />
    </QueryClientProvider>
  );
};

describe("RequirementFormRight Component", () => {
  const mockInitialData: RequirementSourceFormData[] = [
    {
      id: 1,
      sourceNumber: "1.1",
      title: "Test Requirement",
      requirementSource: {
        id: RequirementSourceEnum.ACT2018,
        name: "ACT 2018",
      },
      relatedDocuments: [],
    },
  ];

  beforeEach(() => {
    mountComponent(mockInitialData);
  });

  it("renders the component with initial data", () => {
    cy.contains("button", "Requirement Source").should("exist");
    cy.contains("Test Requirement").should("exist");
  });

  it("opens requirement source modal when add button is clicked", () => {
    cy.contains("button", "Requirement Source").click();
    cy.get("[role='presentation']").should("exist");
    cy.contains("Add Requirement Source").should("exist");

    cy.get('[contenteditable="true"]').type("Test Description");
    cy.contains("button", "Add").should("exist").click();

    cy.get("button[aria-label='close']").should("exist").click();
    cy.get("[role='presentation']").should("not.exist");
  });

  it("displays requirement source card with correct data", () => {
    cy.contains(mockInitialData[0].sourceNumber).should("exist");
    cy.contains(mockInitialData[0].title).should("exist");
  });

  it("allows editing a requirement source", () => {
    cy.get("[data-testid='requirement-source-edit-0']").first().click();
    cy.get("[role='presentation']").should("exist");
    cy.contains("Edit Requirement Source").should("exist");
    cy.get("button[aria-label='close']").should("exist").click();
    cy.get("[role='presentation']").should("not.exist");
  });

  it("shows delete confirmation when trying to delete a requirement source", () => {
    cy.get("[data-testid='requirement-source-delete-0']").first().click();
    cy.contains("Delete Requirement Source?").should("exist");
    cy.contains("button", "Delete").should("exist");
    cy.get("[data-testid='cancel-action-modal-button']")
      .should("exist")
      .click();
    cy.get("[role='presentation']").should("not.exist");
  });

  it("renders images containers", () => {
    cy.contains("Photos").should("exist");
    cy.contains("Figures").should("exist");
  });

  it("renders appendices container", () => {
    cy.contains("Appendices").should("exist");
  });
});

describe("RequirementFormRight Component with Related Documents", () => {
  const mockDataWithRelatedDocs: RequirementSourceFormData[] = [
    {
      id: 1,
      sourceNumber: "1.1",
      title: "Test Requirement",
      requirementSource: {
        id: "REQ",
        name: "Requirement",
      },
      relatedDocuments: [
        {
          id: 1,
          sourceFormId: 1,
          documentTitle: "Related Doc",
          sections: [
            {
              id: 1,
              sourceFormId: 1,
              relatedDocumentFormId: 1,
              sectionNumber: "1.1",
              sectionTitle: "Test Section",
            },
          ],
        },
      ],
    },
  ];

  beforeEach(() => {
    mountComponent(mockDataWithRelatedDocs);
  });

  it("displays related documents", () => {
    cy.contains("Related Doc").should("exist");
  });

  it("displays document sections", () => {
    cy.contains("Test Section").should("exist");
  });

  it("allows adding new document section", () => {
    cy.get(
      "[data-testid='requirement-related-document-add-section-0']"
    ).click();
    cy.get("[role='presentation']").should("exist");
    cy.contains("Add Section").should("exist");
    cy.get("button[aria-label='close']").should("exist").click();
    cy.get("[role='presentation']").should("not.exist");
  });

  it("allows editing a document section", () => {
    cy.get("[data-testid='requirement-related-document-edit-0-0']").click();
    cy.get("[role='presentation']").should("exist");
    cy.contains("Edit Related Document").should("exist");
    cy.get("button[aria-label='close']").should("exist").click();
    cy.get("[role='presentation']").should("not.exist");
  });

  it("shows delete confirmation when trying to delete a section", () => {
    cy.get("[data-testid='requirement-related-document-delete-0-0']")
      .first()
      .click();
    cy.contains("Delete Section?").should("exist");
    cy.contains("button", "Delete").should("exist");
    cy.get("[data-testid='cancel-action-modal-button']")
      .should("exist")
      .click();
    cy.get("[role='presentation']").should("not.exist");
  });
});
