import ImageModal from "@/components/App/Inspections/Profile/Requirements/Images/ImageModal";
import { ImageTypeEnum } from "@/components/App/Inspections/Profile/Requirements/RequirementUtils";
import { RequirementImage } from "@/models/Image";
import { StaffUser } from "@/models/Staff";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockStaffUsers = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
  },
];

describe("ImageModal Component", () => {
  const mockFile = new File(["dummy content"], "test-image.png", {
    type: "image/png",
    lastModified: new Date("2024-01-01").getTime(),
  });

  const mockImageData: RequirementImage = {
    id: 1,
    relative_url: "test-url",
    url: "https://test-image.jpg",
    caption: "Test Caption",
    taken_by: mockStaffUsers[0] as unknown as StaffUser,
    taken_by_id: mockStaffUsers[0].id,
    original_file_name: "existing-image.jpg",
    date_taken: "2024-01-01T00:00:00Z",
    image_type: "Photo",
    sort_order: 1,
  };

  const queryClient = new QueryClient();

  function mountImageModal(
    imageData?: RequirementImage,
    onDelete?: () => void
  ): React.ReactNode {
    return (
      <QueryClientProvider client={queryClient}>
        <ImageModal
          requirementImage={imageData}
          file={mockFile}
          onSubmit={cy.stub().as("onSubmit")}
          inspectionId={1}
          imageType={ImageTypeEnum.PHOTO}
          onDelete={onDelete}
        />
      </QueryClientProvider>
    );
  }

  beforeEach(() => {
    // Mock staff users data hook
    cy.stub(window, "fetch").resolves({
      ok: true,
      json: () => Promise.resolve(mockStaffUsers),
    });
  });

  it("renders add photo modal correctly", () => {
    cy.mount(mountImageModal());

    cy.contains("Add Photo").should("be.visible");
    cy.get("img").should("be.visible");
    cy.contains("Photo #").should("be.visible");
    cy.contains("test-image.png").should("be.visible");
  });

  it("renders edit photo modal correctly", () => {
    const onDelete = cy.stub().as("onDelete");

    cy.mount(mountImageModal(mockImageData, onDelete));

    cy.contains("Edit Photo").should("be.visible");
    cy.get("img").should("be.visible");
    cy.get('input[name="caption"]').should("have.value", "Test Caption");
  });

  it("validates required fields", () => {
    cy.mount(mountImageModal());

    // Try to submit without required fields
    cy.contains("button", "Add").click();

    // Check for validation messages
    cy.contains("Taken By is required").should("be.visible");
    cy.contains("Caption is required").should("be.visible");
  });

  it("submits form with valid data", () => {
    cy.mount(mountImageModal());

    cy.get('input[name="caption"]').type("Test caption");

    // Submit form
    cy.contains("button", "Add").click();
  });

  it("handles delete action", () => {
    const onDelete = cy.stub().as("onDelete");

    cy.mount(mountImageModal(mockImageData, onDelete));

    // Click delete button
    cy.get('[data-testid="delete-action-modal-button"]').click();

    // Confirm deletion
    cy.get('[data-testid="delete-confirmation-button"]').click();

    // Verify delete was triggered
    cy.get("@onDelete").should("have.been.calledWith", mockImageData.id);
  });
});
