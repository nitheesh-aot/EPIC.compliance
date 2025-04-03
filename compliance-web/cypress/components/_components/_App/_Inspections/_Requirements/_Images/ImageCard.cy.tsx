  import ImageCard from "@/components/App/Inspections/Profile/Requirements/Images/ImageCard";
  import { RequirementImage } from "@/models/Image";
import { DndContext } from "@dnd-kit/core";

describe("ImageCard Component", () => {
  const mockImage: RequirementImage = {
    id: 1,
    relative_url: "test-image.jpg",
    caption: "Test Image Caption",
    sort_order: 1,
  };

  const renderImageCard = (props = {}) => {
    const handleImageClick = cy.stub().as("handleImageClick");
    cy.mount(
      <DndContext>
        <ImageCard
          image={mockImage}
          handleImageClick={handleImageClick}
          isPhoto={true}
          {...props}
        />
      </DndContext>
    );
  };

  it("renders with correct image and caption", () => {
    renderImageCard();
    
    // Check if image is rendered with correct source
    cy.get("img").should("have.attr", "src").and("include", "test-image.jpg");
    
    // Check if caption is rendered correctly
    cy.get("a").should("contain.text", "Photo 1: Test Image Caption");
  });

  it("renders as Figure when isPhoto is false", () => {
    renderImageCard({ isPhoto: false });
    cy.get("a").should("contain.text", "Figure 1: Test Image Caption");
  });

  it("shows full caption in tooltip on hover", () => {
    const longCaption = "This is a very long caption that should be truncated in the display but shown fully in the tooltip";
    renderImageCard({
      image: { ...mockImage, caption: longCaption },
    });

    cy.get("[role='tooltip']").should("not.exist");
    cy.get("a").trigger("mouseover");
    cy.get("[role='tooltip']").should("contain.text", longCaption);
  });
});
