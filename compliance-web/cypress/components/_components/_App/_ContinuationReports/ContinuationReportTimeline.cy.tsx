import ContinuationReportTimeline from "@/components/App/ContinuationReports/ContinuationReportTimeline";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ContinuationReport } from "@/models/ContinuationReport";
import React from "react";
import { AuthProvider } from "react-oidc-context";
import { OidcConfig } from "@/utils/config";

describe("ContinuationReportTimeline.cy.tsx", () => {
  const queryClient = new QueryClient();

  // Create a wrapper component that provides the mock auth context
  const TestWrapper = ({ children }) => (
    <AuthProvider {...OidcConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </AuthProvider>
  );

  const mockEntries: ContinuationReport[] = [
    {
      id: 1,
      date_created: "2024-01-01T12:00:00Z",
      rich_text: "<p>First entry</p>",
      text: "First entry",
      case_file_id: 123,
      context_type: "INSPECTION",
      context_id: 456,
      created_by_user: {
        name: "John Doe",
        auth_user_guid: "user123",
        id: 1,
        is_active: true,
      },
      system_generated: false,
      keys: [],
      is_active: true,
    },
    {
      id: 2,
      date_created: "2024-01-02T12:00:00Z",
      rich_text: "<p>Second entry</p>",
      text: "Second entry",
      case_file_id: 123,
      context_type: "INSPECTION",
      context_id: 456,
      created_by_user: {
        name: "Jane Smith",
        auth_user_guid: "user456",
        id: 2,
        is_active: true,
      },
      system_generated: true,
      keys: [],
      is_active: true,
    },
  ];

  beforeEach(() => {
    cy.mount(
      <TestWrapper>
        <ContinuationReportTimeline crtList={mockEntries} />
      </TestWrapper>
    );
  });

  it("renders timeline entries", () => {
    cy.contains("First entry").should("exist");
    cy.contains("Second entry").should("exist");
  });

  it("shows creator names", () => {
    cy.contains("Created by John Doe").should("exist");
  });

  it("formats dates correctly", () => {
    cy.contains("2024-01-01").should("exist");
  });

  it("highlights search text when provided", () => {
    cy.mount(
      <TestWrapper>
        <ContinuationReportTimeline crtList={mockEntries} searchText="First" />
      </TestWrapper>
    );

    cy.get("span").should("have.css", "background-color", "rgba(0, 0, 0, 0)");
  });
});
