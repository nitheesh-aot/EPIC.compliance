// cypress/component/InspectionDrawer.spec.tsx
import { mount } from "cypress/react18";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import InspectionDrawer from "@/components/App/Inspections/InspectionDrawer";
import { Inspection } from "@/models/Inspection";
import dayjs from "dayjs";
import { AttendanceEnum } from "@/components/App/Inspections/InspectionFormUtils";

describe("InspectionDrawer Component", () => {
  let mockOnSubmit: sinon.SinonStub;
  let queryClient: QueryClient;

  const mockInspection: Inspection = {
    id: 1,
    ir_number: "IR12345",
    authorization: "12332",
    regulated_party: "Regulated Party",
    case_file_id: 1,
    project_id: 1,
    initiation_id: 1,
    ir_status_id: 1,
    project_status_id: 1,
    lead_officer_id: 1,
    project_description: "Project Description",
    type: "Type",
    sub_type: "Sub Type",
    location_description: "Location Description",
    lead_officer: { id: 1, full_name: "Officer Name" },
    ir_status: { id: "1", name: "Status" },
    project_status: { id: "1", name: "Project Status" },
    types: [
      { id: "1", name: "Type1" },
      { id: "2", name: "Type2" },
    ],
    start_date: dayjs("2023-01-01").toISOString(),
    end_date: dayjs("2023-01-02").toISOString(),
    inspectionAttendances: [
      {
        attendance_option: { id: AttendanceEnum.MUNICIPAL, name: "Option1" },
        attendance_option_id: AttendanceEnum.MUNICIPAL as unknown as number,
        data: "Muni",
        id: 1,
        inspection_id: 1,
      },
    ],
    utm: "",
    types_text: "Type1, Type2",
    inspection_status: "",
    is_active: false,
    initiation: { id: "1", name: "Initiation" },
    project: { id: 1, name: "Project" },
    case_file: {
      id: 1,
      case_file_number: "12345",
      date_created: dayjs("2023-01-01").toISOString(),
      project_id: 1,
      lead_officer_id: 1,
      case_file_status: "open",
      initiation: { id: "1", name: "Initiation" },
      is_active: true,
      project: { id: 1, name: "Project" },
      lead_officer: { id: 1, full_name: "Officer Name" },
    },
  };

  // Mock data for the query that's causing the issue
  const mockQueryData = {
    data: [
      { id: 1, name: "Item 1" },
      { id: 2, name: "Item 2" },
    ],
  };

  beforeEach(() => {
    mockOnSubmit = cy.stub().as("onSubmit");
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    // Set up the mock data for the query
    queryClient.setQueryData(["someQueryKey"], mockQueryData);

    mount(
      <QueryClientProvider client={queryClient}>
        <InspectionDrawer onSubmit={mockOnSubmit} inspection={mockInspection} />
      </QueryClientProvider>
    );
  });

  it("should render the component with the correct title", () => {
    cy.get("h6").contains(mockInspection.ir_number);
    cy.get("button").contains("Save").should("be.disabled");
    cy.get("button").contains("Cancel").should("be.disabled");
  });

  it("should show the button disabled when creating a new inspection", () => {
    mount(
      <QueryClientProvider client={queryClient}>
        <InspectionDrawer onSubmit={mockOnSubmit} />
      </QueryClientProvider>
    );
    cy.get("button").contains("Create").should("be.disabled");
  });
});
