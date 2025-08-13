import { STAFF_USER_POSITION, APPROVAL_STATUS } from "@/utils/constants";

// Mock Staff Users
export const mockStaffUsers = [
  {
    id: 1,
    name: "John Director",
    first_name: "John",
    last_name: "Director",
    position_id: STAFF_USER_POSITION.DIRECTOR,
    auth_user_guid: "user1",
    is_active: true,
  },
  {
    id: 2,
    name: "Jane Deputy",
    first_name: "Jane",
    last_name: "Deputy",
    position_id: STAFF_USER_POSITION.DEPUTY_DIRECTOR,
    auth_user_guid: "user2",
    is_active: true,
  },
  {
    id: 3,
    name: "Bob Officer",
    first_name: "Bob",
    last_name: "Officer",
    position_id: 1, // Regular officer
    auth_user_guid: "user3",
    is_active: true,
  },
  {
    id: 4,
    name: "Alice Manager",
    first_name: "Alice",
    last_name: "Manager",
    position_id: 2, // Manager
    auth_user_guid: "user4",
    is_active: true,
  },
  {
    id: 5,
    name: "Charlie Inspector",
    first_name: "Charlie",
    last_name: "Inspector",
    position_id: 3, // Inspector
    auth_user_guid: "user5",
    is_active: true,
  },
];

// Mock Projects
export const mockProjects = [
  {
    id: 1,
    name: "Project Alpha",
    description: "Environmental assessment project",
    is_active: true,
  },
  {
    id: 2,
    name: "Project Beta",
    description: "Safety compliance project",
    is_active: true,
  },
  {
    id: 3,
    name: "Project Gamma",
    description: "Regulatory compliance project",
    is_active: true,
  },
  {
    id: 4,
    name: "Project Delta",
    description: "Infrastructure development project",
    is_active: true,
  },
];

// Mock Topics
export const mockTopics = [
  { id: "1", name: "Environmental" },
  { id: "2", name: "Safety" },
  { id: "3", name: "Compliance" },
  { id: "4", name: "Quality Assurance" },
  { id: "5", name: "Risk Management" },
];

// Mock Compliance Findings
export const mockComplianceFindings = [
  { id: "1", name: "Minor Violation" },
  { id: "2", name: "Major Violation" },
  { id: "3", name: "Critical Violation" },
  { id: "4", name: "Non-Compliance" },
  { id: "5", name: "Regulatory Breach" },
];

// Mock Enforcement Actions
export const mockEnforcementActions = [
  { id: "1", name: "Warning Letter" },
  { id: "2", name: "Administrative Penalty" },
  { id: "3", name: "Stop Work Order" },
  { id: "4", name: "Corrective Action Plan" },
  { id: "5", name: "Suspension" },
];

// Mock Requirement Sources
export const mockRequirementSources = [
  { id: "1", name: "Schedule B" },
  { id: "2", name: "Order" },
  { id: "3", name: "EAC" },
  { id: "4", name: "CPD" },
  { id: "5", name: "ACT2018" },
];

// Mock Approval Statuses
export const mockApprovalStatuses = [
  { id: APPROVAL_STATUS.APPROVAL_PENDING, name: "Approval Pending" },
  { id: APPROVAL_STATUS.APPROVED, name: "Approved" },
  { id: APPROVAL_STATUS.NOT_APPROVED, name: "Not Approved" },
];

// Mock Inspection Requirements Grid Data
export const mockInspectionRequirementGridData = [
  {
    id: 1,
    topic: mockTopics[0],
    summary: "Environmental impact assessment required",
    compliance_finding: mockComplianceFindings[0],
    enforcement_action: mockEnforcementActions[0],
    approval_status: mockApprovalStatuses[0],
    sort_order: 1,
    date_issued: "2024-01-15T10:00:00Z",
    ir_number: "IR-2024-001",
    requirement_number: "REQ-001",
    requirement_source: mockRequirementSources[0],
    approved_by: mockStaffUsers[1],
    approved_by_id: 2,
  },
  {
    id: 2,
    topic: mockTopics[1],
    summary: "Safety protocols must be implemented",
    compliance_finding: mockComplianceFindings[1],
    enforcement_action: mockEnforcementActions[1],
    approval_status: mockApprovalStatuses[1],
    sort_order: 2,
    date_issued: "2024-01-16T11:00:00Z",
    ir_number: "IR-2024-002",
    requirement_number: "REQ-002",
    requirement_source: mockRequirementSources[1],
    approved_by: mockStaffUsers[0],
    approved_by_id: 1,
  },
  {
    id: 3,
    topic: mockTopics[2],
    summary: "Compliance monitoring system required",
    compliance_finding: mockComplianceFindings[2],
    enforcement_action: mockEnforcementActions[2],
    approval_status: mockApprovalStatuses[2],
    sort_order: 3,
    date_issued: "2024-01-17T12:00:00Z",
    ir_number: "IR-2024-003",
    requirement_number: "REQ-003",
    requirement_source: mockRequirementSources[2],
    approved_by: mockStaffUsers[2],
    approved_by_id: 3,
  },
];

// Mock External Filters
export const mockExternalFilters = {
  project_id: ["1", "2"],
  primary_officer_id: ["3", "4"],
  inspection_status: ["OPEN"],
  approver_ids: ["1", "2"],
  approval_status: ["APPROVAL_PENDING"],
};

// Mock Column Filters
export const mockColumnFilters = [
  { id: "tpc", value: ["1", "2"] },
  { id: "summary", value: "environmental" },
  { id: "cmd_fnd", value: ["1", "2"] },
  { id: "enf_actn", value: ["1"] },
  { id: "apprv_sts", value: ["APPROVAL_PENDING"] },
  { id: "approver", value: ["1", "2"] },
  { id: "req_src_num", value: "REQ-001" },
  { id: "req_src", value: ["1", "2"] },
  { id: "ir_no", value: "IR-2024" },
  { id: "date_issued", value: "2024-01-15" },
];

// Mock Query Parameters
export const mockQueryParams = {
  page_no: 1,
  page_size: 25,
  sort_by: "date_issued",
  sort_order: "desc" as const,
  tpc_ids: "1,2",
  summary: "environmental",
  cmd_fnd_ids: "1,2",
  enf_actn_ids: "1",
  apprv_sts: "APPROVAL_PENDING",
  approver_ids: "1,2",
  req_src_ids: "1,2",
  req_src_num: "REQ-001",
  ir_no: "IR-2024",
  date_issued: "2024-01-15",
  prm_offc_ids: "3,4",
  insp_sts: "OPEN",
  project_ids: "1,2",
};

// Mock Table State
export const mockTableState = {
  pagination: {
    pageIndex: 0,
    pageSize: 25,
  },
  columnFilters: mockColumnFilters,
  sorting: [
    { id: "date_issued", desc: true },
  ],
  globalFilter: "",
  columnVisibility: {},
  rowSelection: {},
};

// Mock Current User
export const mockCurrentUser = {
  profile: {
    preferred_username: "user2", // Jane Deputy
    given_name: "Jane",
    family_name: "Deputy",
    email: "jane.deputy@example.com",
  },
};

// Mock Auth Context
export const mockAuthContext = {
  user: mockCurrentUser,
  isLoading: false,
  isAuthenticated: true,
  signinSilent: cy.stub(),
  signinRedirect: cy.stub(),
  signoutRedirect: cy.stub(),
  removeUser: cy.stub(),
};

// Mock Staff Context
export const mockStaffContext = {
  data: mockStaffUsers,
  isLoading: false,
  error: null,
  refetch: cy.stub(),
};

// Mock Projects Context
export const mockProjectsContext = {
  data: mockProjects,
  isLoading: false,
  error: null,
  refetch: cy.stub(),
};

// Mock Export Hook
export const mockExportHook = {
  mutate: cy.stub().as("downloadRequirementExport"),
  isPending: false,
  error: null,
};

// Mock Export Hook (Loading)
export const mockExportHookLoading = {
  mutate: cy.stub().as("downloadRequirementExport"),
  isPending: true,
  error: null,
};

// Mock Table Instance
export const mockTableInstance = {
  getState: () => mockTableState,
  getCanPreviousPage: () => true,
  getCanNextPage: () => true,
  previousPage: cy.stub().as("previousPage"),
  nextPage: cy.stub().as("nextPage"),
  setPageIndex: cy.stub(),
  setPageSize: cy.stub(),
  setColumnFilters: cy.stub(),
  setSorting: cy.stub(),
  setGlobalFilter: cy.stub(),
  setColumnVisibility: cy.stub(),
  setRowSelection: cy.stub(),
};

// Mock Table Instance (First Page)
export const mockTableInstanceFirstPage = {
  ...mockTableInstance,
  getState: () => ({
    ...mockTableState,
    pagination: { pageIndex: 0, pageSize: 25 },
  }),
  getCanPreviousPage: () => false,
  getCanNextPage: () => true,
};

// Mock Table Instance (Last Page)
export const mockTableInstanceLastPage = {
  ...mockTableInstance,
  getState: () => ({
    ...mockTableState,
    pagination: { pageIndex: 2, pageSize: 25 },
  }),
  getCanPreviousPage: () => true,
  getCanNextPage: () => false,
};

// Mock Table Instance (Single Page)
export const mockTableInstanceSinglePage = {
  ...mockTableInstance,
  getState: () => ({
    ...mockTableState,
    pagination: { pageIndex: 0, pageSize: 100 },
  }),
  getCanPreviousPage: () => false,
  getCanNextPage: () => false,
};

// Mock Data Dependencies
export const mockDataDependencies = {
  topics: mockTopics,
  complianceFindings: mockComplianceFindings,
  enforcementActions: mockEnforcementActions,
  requirementSources: mockRequirementSources,
  approvalStatusOptions: mockApprovalStatuses,
  staffUsers: mockStaffUsers,
};

// Mock Filter Change Callback
export const mockOnFilterChange = cy.stub().as("onFilterChange");

// Mock Clear All Callback
export const mockOnClearAll = cy.stub().as("onClearAll");

// Mock Filters Change Callback
export const mockOnFiltersChange = cy.stub().as("onFiltersChange");

// Mock Column Filters Change Callback
export const mockOnColumnFiltersChange = cy.stub().as("onColumnFiltersChange");

// Mock Submit Handler
export const mockOnSubmitHandler = cy.stub().as("onSubmitHandler");

// Export all mocks
export default {
  mockStaffUsers,
  mockProjects,
  mockTopics,
  mockComplianceFindings,
  mockEnforcementActions,
  mockRequirementSources,
  mockApprovalStatuses,
  mockInspectionRequirementGridData,
  mockExternalFilters,
  mockColumnFilters,
  mockQueryParams,
  mockTableState,
  mockCurrentUser,
  mockAuthContext,
  mockStaffContext,
  mockProjectsContext,
  mockExportHook,
  mockExportHookLoading,
  mockTableInstance,
  mockTableInstanceFirstPage,
  mockTableInstanceLastPage,
  mockTableInstanceSinglePage,
  mockDataDependencies,
  mockOnFilterChange,
  mockOnClearAll,
  mockOnFiltersChange,
  mockOnColumnFiltersChange,
  mockOnSubmitHandler,
};
