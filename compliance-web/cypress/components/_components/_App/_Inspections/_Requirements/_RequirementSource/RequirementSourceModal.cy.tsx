import RequirementSourceModal from "@/components/App/Inspections/Profile/Requirements/RequirementSource/RequirementSourceModal";
import { RequirementSourceEnum } from "@/utils/constants";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RequirementSourceFormData } from "@/models/InspectionRequirement";
import { RequirementSource } from "@/models/RequirementSource";

const mockRequirementSourceList: RequirementSource[] = [
  { id: RequirementSourceEnum.ACT2018, name: "ACT 2018" },
  { id: RequirementSourceEnum.EACA, name: "EACA" },
  { id: RequirementSourceEnum.OTHER, name: "Other Source" },
];

const mockFormData: RequirementSourceFormData = {
  id: 1,
  dbId: 1,
  requirementSource: mockRequirementSourceList[0],
  sourceNumber: "123",
  title: "Test Title",
  description: { html: "<p>Test</p>", text: "Test" },
  relatedDocuments: [],
};

describe("RequirementSourceModal", () => {
  const queryClient = new QueryClient();

  function mountRequirementSourceModal(args?: {
    formData?: RequirementSourceFormData;
    requirementSource?: RequirementSource;
  }): React.ReactNode {
    const { formData, requirementSource } = args ?? {};

    return (
      <QueryClientProvider client={queryClient}>
        <RequirementSourceModal
          onSubmit={cy.stub().as("onSubmit")}
          inspectionId={1}
          requirementSourceFormData={formData}
          requirementSource={requirementSource ?? mockRequirementSourceList[0]}
        />
      </QueryClientProvider>
    );
  }

  beforeEach(() => {
    // Mock the API hook
    cy.stub(window, "fetch").resolves({
      ok: true,
      json: () => Promise.resolve(mockRequirementSourceList),
    });
  });

  it("renders add requirement source form correctly", () => {
    cy.mount(mountRequirementSourceModal());

    cy.contains("Add Requirement Source").should("be.visible");
    cy.contains("Requirement Source").should("exist");
    cy.contains("Section #").should("exist");
    cy.contains("Title").should("exist");
    cy.contains("Description").should("be.visible");
    cy.contains("button", "Add").should("be.visible");
  });

  it("renders edit requirement source form correctly", () => {
    cy.mount(
      mountRequirementSourceModal({
        formData: mockFormData,
        requirementSource: mockRequirementSourceList[0],
      })
    );

    cy.contains("Edit Requirement Source").should("be.visible");
    cy.get('input[name="requirementSource"]').should("be.disabled");
    cy.contains("button", "Save").should("be.visible");
  });

  it("shows Amendment # field when EACA source is selected", () => {
    cy.mount(mountRequirementSourceModal({ requirementSource: mockRequirementSourceList[1] }));

    cy.contains("Amendment #").should("be.visible");
  });

  it("shows Condition # instead of Section # when condition source is selected", () => {
    cy.mount(mountRequirementSourceModal({ requirementSource: mockRequirementSourceList[1] }));

    cy.contains("Condition #").should("exist");
    cy.contains("Section #").should("not.exist");
  });

    it("validates required fields", () => {
      cy.mount(mountRequirementSourceModal());

      // Try to submit without required fields
      cy.contains("button", "Add").click();
      cy.contains("Description is required").should("be.visible");
    });

    it("submits form with valid data", () => {
      cy.mount(mountRequirementSourceModal({ requirementSource: mockRequirementSourceList[1] }));

      // Fill out the form
      cy.get('input[name="sourceAmendmentNumber"]').type("A1");
      cy.get('input[name="sourceNumber"]').type("123");
      cy.get('input[name="sourceTitle"]').type("Test Title");

      // Type in the Lexical editor
      cy.get('[contenteditable="true"]').type("Test Description");

      // Submit the form
      cy.contains("button", "Add").click();

      // Verify submission
      cy.get("@onSubmit").should("be.calledOnce");
      cy.get("@onSubmit").should("be.calledWithMatch", {
        requirementSource: { id: RequirementSourceEnum.EACA, name: "EACA" },
        sourceAmendmentNumber: "A1",
        sourceNumber: "123",
        sourceTitle: "Test Title",
        description: {
          html: Cypress.sinon.match.string,
          text: Cypress.sinon.match.string,
        },
      });
    });
});
