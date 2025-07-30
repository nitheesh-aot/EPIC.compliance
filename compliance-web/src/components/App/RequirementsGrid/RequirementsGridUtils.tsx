import { MRT_ColumnDef, MRT_TableState } from "material-react-table";
import { useCallback } from "react";
import { Chip } from "@mui/material";
import { APPROVAL_STATUS } from "@/utils/constants";
import dateUtils from "@/utils/dateUtils";
import PageLink from "@/components/Shared/PageLink";
import {
  InspectionRequirementGrid,
  InspectionRequirementGridQueryParams,
} from "@/models/InspectionRequirementGrid";
import { Topic } from "@/models/Topic";
import { ComplianceFinding } from "@/models/ComplianceFinding";
import { EnforcementAction } from "@/models/EnforcementAction";
import { RequirementSource } from "@/models/RequirementSource";
import { ApprovalStatus } from "@/models/ApprovalStatus";
import { StaffUser } from "@/models/Staff";

// Types for the data dependencies
export interface RequirementsGridDataDependencies {
  topics?: Topic[];
  complianceFindings?: ComplianceFinding[];
  enforcementActions?: EnforcementAction[];
  requirementSources?: RequirementSource[];
  approvalStatusOptions?: ApprovalStatus[];
  staffUsers?: StaffUser[];
}

// Convert column filters to API query parameters
export const useConvertFiltersToQueryParams = (
  externalFilters: Record<string, string[] | string>
) => {
  return useCallback(
    (filters: MRT_TableState<InspectionRequirementGrid>["columnFilters"]) => {
      const params: Partial<InspectionRequirementGridQueryParams> = {};

      filters.forEach((filter) => {
        switch (filter.id) {
          case "topic":
            if (Array.isArray(filter.value) && filter.value.length > 0) {
              params.tpc_ids = filter.value.join(",");
            }
            break;
          case "summary":
            if (typeof filter.value === "string" && filter.value.trim()) {
              params.summary = filter.value.trim();
            }
            break;
          case "compliance_finding":
            if (Array.isArray(filter.value) && filter.value.length > 0) {
              params.cmd_fnd_ids = filter.value.join(",");
            }
            break;
          case "enforcement_action":
            if (Array.isArray(filter.value) && filter.value.length > 0) {
              params.enf_actn_ids = filter.value.join(",");
            }
            break;
          case "approval_status":
            if (Array.isArray(filter.value) && filter.value.length > 0) {
              params.apprv_sts = filter.value.join(",");
            }
            break;
          case "reviewer":
            if (Array.isArray(filter.value) && filter.value.length > 0) {
              params.reviewer_ids = filter.value.join(",");
            }
            break;
          case "requirement_number":
            if (typeof filter.value === "string" && filter.value.trim()) {
              params.req_src_num = filter.value.trim();
            }
            break;
          case "requirement_source":
            if (Array.isArray(filter.value) && filter.value.length > 0) {
              params.req_src_ids = filter.value.join(",");
            }
            break;
          case "ir_number":
            if (typeof filter.value === "string" && filter.value.trim()) {
              params.ir_no = filter.value.trim();
            }
            break;
          case "date_issued":
            if (typeof filter.value === "string" && filter.value.trim()) {
              // Convert the formatted date back to ISO format for the API
              const dateValue = filter.value.trim();
              if (dateValue) {
                // Assuming the date is in the format used by dateUtils.formatDate
                // You may need to adjust this based on your API expectations
                params.date_issued = dateValue;
              }
            }
            break;
          // requirement_number is not in the query params interface, so skip it
        }
      });

      // Add external filters
      Object.entries(externalFilters).forEach(([key, value]) => {
        if (value && (Array.isArray(value) ? value.length > 0 : value !== "")) {
          switch (key) {
            case "primary_officer_id":
              params.prm_offc_ids = Array.isArray(value)
                ? value.join(",")
                : value;
              break;
            case "reviewer_ids":
              params.reviewer_ids = Array.isArray(value)
                ? value.join(",")
                : value;
              break;
            case "approval_status":
              params.apprv_sts = Array.isArray(value) ? value.join(",") : value;
              break;
            case "inspection_status":
              params.insp_sts = Array.isArray(value) ? value.join(",") : value;
              break;
            case "project_id":
              params.project_ids = Array.isArray(value)
                ? value.join(",")
                : value;
              break;
          }
        }
      });

      return params;
    },
    [externalFilters]
  );
};

// Create columns configuration
export const useRequirementsGridColumns = (
  dataDependencies: RequirementsGridDataDependencies
): MRT_ColumnDef<InspectionRequirementGrid>[] => {
  const {
    topics,
    complianceFindings,
    enforcementActions,
    requirementSources,
    approvalStatusOptions,
    staffUsers,
  } = dataDependencies;

  return [
    {
      accessorFn: (row) => row.topic?.name,
      id: "topic",
      header: "Topic",
      filterVariant: "multi-select",
      filterSelectOptions:
        topics?.map((topic) => ({
          text: topic.name,
          value: topic.id.toString(),
        })) ?? [],
      size: 120,
    },
    {
      accessorKey: "summary",
      header: "Requirement Summary",
      filterFn: "contains",
      size: 200,
    },
    {
      accessorFn: (row) => row.compliance_finding?.name,
      id: "compliance_finding",
      header: "Compliance Finding",
      filterVariant: "multi-select",
      filterSelectOptions:
        complianceFindings?.map((complianceFinding) => ({
          text: complianceFinding.name,
          value: complianceFinding.id.toString(),
        })) ?? [],
      size: 80,
    },
    {
      accessorFn: (row) => row.enforcement_action?.name,
      id: "enforcement_action",
      header: "Enforcement Action",
      filterVariant: "multi-select",
      filterSelectOptions:
        enforcementActions?.map((enforcementAction) => ({
          text: enforcementAction.name,
          value: enforcementAction.id.toString(),
        })) ?? [],
      size: 150,
    },
    {
      accessorKey: "approval_status",
      header: "Approval Status",
      Cell: ({ row }) => {
        return row.original.approval_status ? (
          <Chip
            label={row.original.approval_status.name}
            color={
              row.original.approval_status.id ===
              APPROVAL_STATUS.APPROVAL_PENDING
                ? "warning"
                : row.original.approval_status.id === APPROVAL_STATUS.APPROVED
                  ? "success"
                  : "error"
            }
            variant="outlined"
            size="small"
          />
        ) : (
          <></>
        );
      },
      filterVariant: "multi-select",
      filterSelectOptions:
        approvalStatusOptions?.map((approvalStatus) => ({
          text: approvalStatus.name,
          value: approvalStatus.id.toString(),
        })) ?? [],
      size: 120,
    },
    {
      accessorFn: (row) => row.approved_by?.name,
      id: "reviewer",
      header: "Reviewer",
      filterVariant: "multi-select",
      filterSelectOptions:
        staffUsers?.map((staffUser) => ({
          text: staffUser.name,
          value: staffUser.id.toString(),
        })) ?? [],
      size: 100,
    },
    {
      accessorKey: "requirement_number",
      header: "Condition #",
      filterFn: "contains",
      size: 80,
    },
    {
      accessorFn: (row) => row.requirement_source?.name,
      id: "requirement_source",
      header: "Source",
      filterVariant: "multi-select",
      filterSelectOptions:
        requirementSources?.map((requirementSource) => ({
          text: requirementSource.name,
          value: requirementSource.id.toString(),
        })) ?? [],
      size: 100,
    },
    {
      accessorKey: "ir_number",
      header: "IR #",
      filterFn: "contains",
      Cell: ({ row }) => (
        <PageLink
          to="/ce-database/inspections/$inspectionNumber"
          params={{ inspectionNumber: row.original.ir_number }}
        />
      ),
      size: 120,
    },
    {
      accessorFn: (row) =>
        row.date_issued ? dateUtils.formatDate(row.date_issued) : "",
      id: "date_issued",
      header: "IR Issuance Date",
      filterVariant: "date",
      filterFn: "greaterThanOrEqual",
      size: 120,
    },
  ];
};
