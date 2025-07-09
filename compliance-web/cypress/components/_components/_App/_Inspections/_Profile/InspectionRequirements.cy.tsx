import React from "react";
import { mount } from "cypress/react18";
import { InspectionRequirement } from "@/models/InspectionRequirement";
import { ComplianceFinding } from "@/models/ComplianceFinding";
import { RequirementSource } from "@/models/RequirementSource";
import { RequirementDocumentType } from "@/models/RequirementDocumentType";
import { Topic } from "@/models/Topic";
import { Agency } from "@/models/Agency";
import InspectionRequirements from "@/components/App/Inspections/Profile/InspectionRequirements";
import { Inspection } from "@/models/Inspection";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import DrawerProvider from "@/components/Shared/Drawer/DrawerProvider";

const mockTopic: Topic = {
  id: 1,
  name: "Test Topic",
  is_active: true,
};

const mockAgency: Agency = {
  id: 1,
  name: "Test Agency",
  is_active: true,
};

const mockComplianceFinding: ComplianceFinding = {
  id: "1",
  name: "In Compliance",
};

const mockRequirementSource: RequirementSource = {
  id: "1",
  name: "Test Source",
};

const mockDocumentType: RequirementDocumentType = {
  id: "1",
  name: "Test Document Type",
};

// Create multiple mock requirements to test list rendering
const mockRequirements: InspectionRequirement[] = [
  {
    id: 1,
    req_type: {
      id: "REQ",
      name: "Requirement",
    },
    inspection_id: 123,
    summary: "Test Requirement Summary 1",
    topic_id: 1,
    topic: mockTopic,
    agency_id: 1,
    agency: mockAgency,
    enforcement_action_id: 0,
    compliance_finding_id: 1,
    compliance_finding: mockComplianceFinding,
    enforcement_action_data: [],
    findings: "<p>Test findings content for requirement 1</p>",
    sort_order: 1,
    is_active: true,
    requirement_source_details: [
      {
        id: 1,
        requirement_id: 1,
        requirement_source_id: 1,
        requirement_source: mockRequirementSource,
        section_number: "1.1",
        condition_number: "C-1",
        amendment_number: "A-1",
                title: "Test Requirement Source 1",
        description: "Test description for requirement source 1",
        is_active: true,
        appendix_id: undefined,
        appendix: undefined,
        order_id: undefined,
        order: undefined,
        documents: [
          {
            id: 1,
            req_detail_id: 1,
            document_type: mockDocumentType,
            document_type_id: 1,
            document_title: "Test Document 1",
            section_number: "2.1",
            section_title: "Test Section 1",
            description: "Test document description 1",
            is_active: true,
            appendix_id: undefined,
            appendix: undefined,
          },
        ],
      },
    ],
  },
  {
    id: 2,
    req_type: {
      id: "REQ",
      name: "Requirement",
    },
    inspection_id: 123,
    summary: "Test Requirement Summary 2",
    topic_id: 1,
    topic: { ...mockTopic, name: "Air Quality" },
    agency_id: 1,
    agency: mockAgency,
    enforcement_action_id: 0,
    compliance_finding_id: 1,
    compliance_finding: { ...mockComplianceFinding, name: "Non-Compliance" },
    enforcement_action_data: [],
    findings: "<p>Test findings content for requirement 2</p>",
    sort_order: 2,
    is_active: true,
    requirement_source_details: [
      {
        id: 2,
        requirement_id: 2,
        requirement_source_id: 1,
        requirement_source: mockRequirementSource,
        section_number: "2.2",
        condition_number: "C-2",
        amendment_number: "A-2",
                title: "Test Requirement Source 2",
        description: "Test description for requirement source 2",
        is_active: true,
        appendix_id: undefined,
        appendix: undefined,
        order_id: undefined,
        order: undefined,
        documents: [
              {
                id: 2,
                req_detail_id: 2,
                document_type: mockDocumentType,
                document_type_id: 1,
                document_title: "Test Document 2",
                section_number: "3.1",
                section_title: "Test Section 2",
                description: "Test document description 2",
                is_active: true,
                appendix_id: undefined,
                appendix: undefined,
              },
            ],
      },
    ],
  },
];

const mockInspection: Inspection = {
  id: 1,
  ir_number: "IR-2023-123",
  case_file_id: 1,
  project_id: 1,
  location_description: "Test Location",
  utm: "Test UTM",
  initiation_id: 1,
  ir_status_id: 1,
  project_status_id: 1,
  primary_officer_id: 1,
  start_date: "2023-01-01",
  end_date: "2023-01-02",
  types: [{ id: "1", name: "Routine" }],
  types_text: "Routine",
  inspection_status: "Open",
  is_active: true,
  initiation: { id: "1", name: "Planned" },
  project: { id: 1, name: "Test Project" },
  primary_officer: {
    id: 1,
    name: "Test Officer",
    auth_user_guid: "test-guid",
    is_active: true,
  },
  ir_status: { id: "1", name: "Complete" },
  case_file: {
    id: 1,
    case_file_number: "CF-2023-001",
    project_id: 0,
    date_created: "",
    primary_officer_id: 0,
    case_file_status: "",
    initiation: undefined,
    is_active: false,
    project: undefined,
    primary_officer: undefined,
  },
  project_status: { id: "1", name: "Active" },
  debrief_date: "2023-01-03",
};

describe("InspectionRequirements Component", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    cy.viewport(1280, 800);
    // Create a new QueryClient for each test
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    // Mock the API response for inspection requirements
    cy.intercept("GET", "/api/inspection-requirements*", {
      statusCode: 200,
      body: mockRequirements,
    }).as("getRequirements");

    // Pre-populate the query cache with mock data
    queryClient.setQueryData(
      ["inspection-requirements", mockInspection.id],
      mockRequirements
    );

    queryClient.setQueryData(
      ["topics"],
      [mockTopic, { id: "2", name: "Some Topic" }]
    );
    queryClient.setQueryData(
      ["inspection-requirement-types"],
      [
        { id: "REQ", name: "Requirement" },
        { id: "REG", name: "Regulatory Consideration" },
      ]
    );

    mount(
      <QueryClientProvider client={queryClient}>
        <DrawerProvider />
        <InspectionRequirements inspectionData={mockInspection} />
      </QueryClientProvider>
    );
  });

  it("displays the requirements list header", () => {
    cy.contains("Requirements").should("be.visible");
    cy.contains("New Requirement").should("be.visible");
  });

  it("renders multiple requirements in the list", () => {
    // Check if both requirements are displayed
    cy.contains("Test Requirement Summary 1").should("be.visible");
    cy.contains("Test Requirement Summary 2").should("be.visible");

    // Verify the requirements are displayed in the correct order
    cy.get("[data-cy=requirement-card-title]")
      .eq(0)
      .contains("Test Requirement Summary 1");
    cy.get("[data-cy=requirement-card-title]")
      .eq(1)
      .contains("Test Requirement Summary 2");
  });

  it("displays requirement details correctly", () => {
    // Check first requirement details
    cy.contains("Test Topic").should("be.visible");
    cy.contains("In Compliance").should("be.visible");
    cy.contains("Test Source").should("be.visible");
    cy.contains("C-1").should("be.visible");

    // Check second requirement details
    cy.contains("Air Quality").should("be.visible");
    cy.contains("Non-Compliance").should("be.visible");
    cy.contains("C-2").should("be.visible");
  });

  it("opens the drawer when the card is clicked", () => {
    cy.get("[data-cy=requirement-card-title]").eq(0).click();

    cy.get("div[role=presentation]").should("be.visible");
    cy.contains("Edit Requirement #1").should("be.visible");
    cy.contains("Test Topic").should("be.visible");
    cy.get("button[aria-label=close]").should("be.visible").click();
  });

  it("handles editing an existing requirement", () => {
    // Mock the PUT API call for updating a requirement
    cy.intercept("PUT", "/api/inspection-requirements/1", {
      statusCode: 200,
      body: {
        ...mockRequirements[0],
        summary: "Updated Requirement Summary",
      },
    }).as("updateRequirement");

    // Click on the first requirement
    cy.get("[data-cy=requirement-card-title]").eq(0).click();
    
    // Wait for the drawer to be fully visible before clicking the edit button
    cy.get("div[role=presentation]").should("be.visible");
    
    // Use { force: true } to ensure we click even if there's a transition happening
    cy.get("[data-cy=editable-requirement-button]")
      .should("be.visible")
      .click({ force: true });

    cy.get("button[aria-label=close]").should("be.visible").click();
  });

  it("shows empty state when no requirements exist", () => {
    // Create a new QueryClient
    const emptyQueryClient = new QueryClient();

    // Set empty requirements data
    emptyQueryClient.setQueryData(
      ["inspection-requirements", mockInspection.id],
      []
    );
    emptyQueryClient.setQueryData(
      ["inspection-requirement-images", mockInspection.id],
      []
    );

    // Mock the API to return empty array
    cy.intercept("GET", "/api/inspection-requirements*", {
      statusCode: 200,
      body: [],
    }).as("getEmptyRequirements");
    cy.intercept("GET", "/api/inspection-requirement-images*", {
      statusCode: 200,
      body: [],
    }).as("getEmptyRequirementImages");

    // Mount with empty data
    mount(
      <QueryClientProvider client={emptyQueryClient}>
        <InspectionRequirements inspectionData={mockInspection} />
      </QueryClientProvider>
    );

    // Check for empty state message
    cy.contains("Requirements").should("be.visible");
    cy.contains("New Requirement").should("be.visible");
  });

  it("handles adding a new requirement", () => {
    // Click on add requirement button with force option
    cy.get("[data-cy=new-requirement-button]").click({ force: true });

    // Wait for the form to be visible before interacting with it
    cy.get("textarea[name=requirementSummary]").should("be.visible");
    
    // Fill in the form fields
    cy.get("textarea[name=requirementSummary]").type("New Requirement");
    cy.get("input[name=topic]").click();
    cy.contains("Some Topic").click();

    cy.get('[contenteditable="true"]').type("New findings");

    // Submit the form
    cy.get("button[type=submit]").click();
    cy.get("button[aria-label=close]").should("be.visible").click();
  });
});
