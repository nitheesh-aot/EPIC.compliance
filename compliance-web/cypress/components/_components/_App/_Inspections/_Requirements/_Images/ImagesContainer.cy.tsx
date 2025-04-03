import ImagesContainer from "@/components/App/Inspections/Profile/Requirements/Images/ImagesContainer";
import { ImageTypeEnum } from "@/components/App/Inspections/Profile/Requirements/RequirementUtils";
import ModalProvider from "@/components/Shared/Modals/ModalProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRequirementStore } from "@/components/App/Inspections/Profile/Requirements/requirementStore";
import { RequirementImage } from "@/models/Image";

describe("ImagesContainer", () => {
  const mockProps = {
    imageType: ImageTypeEnum.PHOTO,
    inspectionId: 123,
    requirementId: 1,
  };

  const queryClient = new QueryClient();

  const renderImagesContainer = (props = mockProps) => {
    return (
      <QueryClientProvider client={queryClient}>
        <ModalProvider />
        <ImagesContainer {...props} />
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    // Wrap component with required providers
    cy.mount(renderImagesContainer());
  });

  it("renders accordion with correct title", () => {
    cy.contains("Photos").should("be.visible");
  });

  it("expands accordion on click", () => {
    cy.get(".MuiAccordionSummary-root").click();
    cy.get(".MuiAccordionDetails-root").should("be.visible");
    cy.contains("No photos uploaded yet").should("be.visible");
  });

  it("shows add button when expanded", () => {
    cy.get(".MuiAccordionSummary-root").click();
    cy.contains("button", "Photo").should("be.visible");
  });

  // it("handles file selection", () => {
  //   cy.get(".MuiAccordionSummary-root").click();

  //   // Create a mock file
  //   const testFile = new File(["test image"], "test.jpg", {
  //     type: "image/jpeg",
  //   });

  //   // Stub file input click and change
  //   cy.window().then((win) => {
  //     cy.stub(win.document, "createElement").callsFake((tag) => {
  //       if (tag === "input") {
  //         const input = win.document.createElement("input");
  //         setTimeout(() => {
  //           const event = new Event("change");
  //           Object.defineProperty(input, "files", {
  //             value: [testFile],
  //           });
  //           input.dispatchEvent(event);
  //         }, 100);
  //         return input;
  //       }
  //       return win.document.createElement(tag);
  //     });
  //   });

  //   cy.contains("button", "Photo").click();
  //   // Modal should open
  //   cy.get('[role="dialog"]').should("exist");
  // });

  it("renders with figures type", () => {
    cy.mount(
      renderImagesContainer({
        imageType: ImageTypeEnum.FIGURE,
        inspectionId: 123,
        requirementId: 1,
      })
    );

    cy.contains("Figures").should("be.visible");
  });

  // Test with pre-populated images
  it("displays images when available", () => {
    const mockImage: RequirementImage = {
      id: 1,
      relative_url: "test-url",
      caption: "Test Caption",
      sort_order: 1,
    };

    useRequirementStore.getState().setRequirementPhotos({
      [1]: [mockImage],
    });

    cy.mount(
      renderImagesContainer({
        imageType: ImageTypeEnum.PHOTO,
        inspectionId: 123,
        requirementId: 1,
      })
    );

    cy.get(".MuiAccordionSummary-root").click();
    cy.get('[data-testid="image-card-1"]').should("exist");
  });
});
