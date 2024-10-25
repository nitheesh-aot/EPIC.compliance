import { mount } from "cypress/react18";
import CaseFileGeneralInformation from "@/components/App/CaseFiles/Profile/CaseFileGeneralInformation";
import { CaseFile } from "@/models/CaseFile";
import { INITIATION } from "@/utils/constants";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import dateUtils from "@/utils/dateUtils";

describe("CaseFileGeneralInformation", () => {
  let mockOnEdit: sinon.SinonStub;
  let queryClient: QueryClient;

  const mockCaseFile: CaseFile = {
    id: 1,
    project: { id: 1, name: "Test Project" },
    date_created: "2023-04-15T12:00:00Z",
    initiation: { id: "1", name: "Test Initiation" },
    primary_officer: { id: 1, full_name: "John Doe" },
    officers: [
      { id: 2, full_name: "Jane Smith" },
      { id: 3, full_name: "Bob Johnson" },
    ],
    project_id: 0,
    primary_officer_id: 0,
    case_file_number: "",
    case_file_status: "",
    is_active: false,
  };

  const mockQueryData = {
    data: [
      { id: 1, name: "Item 1" },
      { id: 2, name: "Item 2" },
    ],
  };

  const mountComponent = (caseFileData = mockCaseFile) => {
    mount(
      <QueryClientProvider client={queryClient}>
        <CaseFileGeneralInformation
          caseFileData={caseFileData}
          onEdit={mockOnEdit}
        />
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    mockOnEdit = cy.stub().as("onEditStub");
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    // Set up the mock data for the query
    queryClient.setQueryData(["someQueryKey"], mockQueryData);
    mountComponent();
  });

  it("renders the component with correct general information", () => {
    cy.contains("General Information").should("be.visible");
    cy.contains("Test Project").should("be.visible");
    cy.contains(dateUtils.formatDate(mockCaseFile.date_created)).should(
      "be.visible"
    );
    cy.contains("Test Initiation").should("be.visible");
    cy.contains("John Doe").should("be.visible");
    cy.contains("Jane Smith, Bob Johnson").should("be.visible");
  });

  it("calls onEdit when the Edit button is clicked", () => {
    cy.contains("button", "Edit").click();
    cy.get("@onEditStub").should("have.been.calledOnce");
  });

  it("renders CaseFileInspectionsTable when INSPECTION records exist", () => {
    const inspectionCaseFile: CaseFile = {
      ...mockCaseFile,
      initiation: { id: INITIATION.INSPECTION_ID, name: "Inspection" },
    };
    mountComponent(inspectionCaseFile);
    cy.get("#case-file-inspections-table").should("exist");
  });

  it("renders CaseFileComplaintsTable when COMPLAINTS records exist", () => {
    const complaintsCaseFile: CaseFile = {
      ...mockCaseFile,
      initiation: { id: INITIATION.COMPLAINTS_ID, name: "Complaints" },
    };
    mountComponent(complaintsCaseFile);
    cy.get("#case-file-complaints-table").should("exist");
  });
});
