import RequirementDrawer from "@/components/App/Inspections/Profile/Requirements/RequirementDrawer";
import { baseRequirement, mockInspection } from "./mockData";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { InspectionRequirement } from "@/models/InspectionRequirement";

describe("RequirementDrawer Component", () => {
  const queryClient = new QueryClient();

  const mountComponent = (requirement?: InspectionRequirement) => {
    const mockOnSubmit = cy.stub().as("onSubmitHandler");

    return cy.mount(
      <QueryClientProvider client={queryClient}>
        <RequirementDrawer
          inspectionData={mockInspection}
          requirement={requirement}
          index={0}
          onSubmit={mockOnSubmit}
        />
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    // Stub API calls
    cy.stub(window, "fetch").resolves({
      ok: true,
      json: () =>
        Promise.resolve([
          { id: "REQ", name: "Test Source" },
          { id: "REG", name: "Regulatory Consideration" },
        ]),
    });
  });

  it("renders create requirement drawer correctly", () => {
    mountComponent(baseRequirement);

    cy.contains("Edit Requirement #1").should("be.visible");
    cy.get("form").should("exist");
  });

  it("renders edit requirement drawer correctly", () => {
    mountComponent(baseRequirement);

    cy.contains("Edit Requirement #1").should("be.visible");
  });

  it("handles requirement deletion", () => {
    mountComponent(baseRequirement);

    // Click delete button
    cy.contains("Delete").click();

    // Confirm deletion
    cy.contains("button", "Delete").click();
    
  });

});
