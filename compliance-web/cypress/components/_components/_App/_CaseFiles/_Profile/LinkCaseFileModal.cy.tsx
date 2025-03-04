import React from "react";
import { mount } from "cypress/react18";
import LinkCaseFileModal from "@/components/App/CaseFiles/Profile/LinkCaseFileModal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CaseFile } from "@/models/CaseFile";

describe("LinkCaseFileModal Component", () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const mockCaseFiles = [
    { id: 1, case_file_number: "CF-001" },
    { id: 2, case_file_number: "CF-002" },
    { id: 3, case_file_number: "CF-003" },
  ];

  const mockLinkedCaseFiles: CaseFile[] = [
    {
      id: 4,
      case_file_number: "CF-004",
      project_id: 0,
      date_created: "2024-01-01",
      primary_officer_id: 0,
      case_file_status: "OPEN",
      initiation: undefined,
      is_active: false,
      project: undefined,
      primary_officer: undefined,
    },
  ];
  beforeEach(() => {
    // Mock the useCaseFilesData hook response
    cy.stub(window, "fetch").callsFake((url) => {
      if (url.toString().includes("/api/case-files")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCaseFiles),
        });
      }
      return Promise.reject(new Error(`Unhandled fetch request: ${url}`));
    });

    // Reset the query client before each test
    queryClient.clear();

    // Set the query data directly to ensure it's available
    queryClient.setQueryData(["case-files"], mockCaseFiles);
  });

  function mountComponent(fileNumber: string, isEdit: boolean) {
    const onSubmitSpy = cy.spy().as("onSubmitSpy");
    return mount(
      <QueryClientProvider client={queryClient}>
        <LinkCaseFileModal
          onSubmit={onSubmitSpy}
          fileNumber={fileNumber}
          linkedCaseFiles={mockLinkedCaseFiles}
          isEdit={isEdit}
        />
      </QueryClientProvider>
    );
  }

  it("renders in link mode correctly", () => {
    mountComponent("CF-100", false);

    // Check title
    cy.contains("Link to Case File").should("be.visible");
    // Check autocomplete is present
    cy.get('input[name="caseFile"]').should("be.visible");
    // Check button text
    cy.contains("button", "Link").should("be.visible");
  });

  it("renders in unlink mode correctly", () => {
    mountComponent("CF-100", true);

    // Check title
    cy.contains("Unlink from Case File").should("be.visible");
    // Check autocomplete is present
    cy.get('input[name="caseFile"]').should("be.visible");
    // Check button text
    cy.contains("button", "Unlink").should("be.visible");
  });

  it("filters out current file number and linked files in link mode", () => {
    const currentFileNumber = "CF-001";

    mountComponent(currentFileNumber, false);

    // Open dropdown
    cy.get('input[name="caseFile"]').click();
    // Should not show the current file number
    cy.contains("CF-001").should("not.exist");
    // Should not show linked files
    cy.contains("CF-004").should("not.exist");
    // Should show other files
    cy.contains("CF-002").should("be.visible");
    cy.contains("CF-003").should("be.visible");
  });

  it("shows only linked files in unlink mode", () => {
    mountComponent("CF-100", true);

    // Open dropdown
    cy.get('input[name="caseFile"]').click();
    // Should only show linked files
    cy.contains("CF-004").should("be.visible");
    // Should not show other files
    cy.contains("CF-001").should("not.exist");
    cy.contains("CF-002").should("not.exist");
    cy.contains("CF-003").should("not.exist");
  });

  it("submits the form with selected case file ID", () => {
    mountComponent("CF-100", false);

    // Open dropdown and select an option
    cy.get('input[name="caseFile"]').click();
    cy.contains("CF-002").click();
    // Submit the form
    cy.contains("button", "Link").click();
    // Check if onSubmit was called with the correct ID
    cy.get("@onSubmitSpy").should("have.been.calledWith", 2);
  });

  it("disables button when no case files are available", () => {
    mountComponent("CF-100", false);

    // Override the intercept to return empty array
    cy.intercept("GET", "/api/case-files*", {
      statusCode: 200,
      body: [],
    }).as("getEmptyCaseFiles");

    // Action buttons should not be visible
    cy.contains("button", "Link").should("be.disabled");
  });
});
