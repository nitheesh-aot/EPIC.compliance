import MasterDataTable from "@/components/Shared/MasterDataTable/MasterDataTable";
import PageLink from "@/components/Shared/PageLink";
import { useRequirementSourcesData } from "@/hooks/useComplaints";
import {
  useComplianceFindingsData,
  useEnforcementActionsData,
} from "@/hooks/useInspectionRequirements";
import { useInspectionRequirementsGrid } from "@/hooks/useInspectionRequirementsGrid";
import { useTopicsData } from "@/hooks/useTopics";
import {
  InspectionRequirementGrid,
  InspectionRequirementGridQueryParams,
} from "@/models/InspectionRequirementGrid";
import { DEFAULT_PAGE_SIZE } from "@/utils/constants";
import dateUtils from "@/utils/dateUtils";
import { Box, Chip, CircularProgress } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { MRT_ColumnDef, MRT_TableState } from "material-react-table";
import { useMemo, useState, useCallback } from "react";

export const Route = createFileRoute(
  "/_authenticated/ce-database/requirements/"
)({
  component: Requirements,
});

function Requirements() {
  const { data: topics } = useTopicsData();
  const { data: complianceFindings } = useComplianceFindingsData();
  const { data: enforcementActions } = useEnforcementActionsData();
  const { data: requirementSources } = useRequirementSourcesData();
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  });

  const [columnFilters, setColumnFilters] = useState<
    MRT_TableState<InspectionRequirementGrid>["columnFilters"]
  >([]);
  const [globalFilter, setGlobalFilter] = useState<string>("");

  // Convert column filters to API query parameters
  const convertFiltersToQueryParams = useCallback(
    (filters: MRT_TableState<InspectionRequirementGrid>["columnFilters"]) => {
      const params: Partial<InspectionRequirementGridQueryParams> = {};

      filters.forEach((filter) => {
        switch (filter.id) {
          case "topic":
            if (Array.isArray(filter.value) && filter.value.length > 0) {
              params.topic_id = filter.value[0];
            }
            break;
          case "summary":
            if (typeof filter.value === "string" && filter.value.trim()) {
              params.summary = filter.value.trim();
            }
            break;
          case "compliance_finding":
            if (Array.isArray(filter.value) && filter.value.length > 0) {
              params.compliance_finding_id = filter.value[0];
            }
            break;
          case "enforcement_action":
            if (Array.isArray(filter.value) && filter.value.length > 0) {
              params.enforcement_action_id = filter.value[0];
            }
            break;
          case "approval_status":
            if (Array.isArray(filter.value) && filter.value.length > 0) {
              params.approval_status = filter.value[0];
            }
            break;
          case "requirement_source":
            if (Array.isArray(filter.value) && filter.value.length > 0) {
              params.requirement_source_id = filter.value[0];
            }
            break;
          case "ir_number":
            if (typeof filter.value === "string" && filter.value.trim()) {
              params.ir_number = filter.value.trim();
            }
            break;
          case "date_issued":
            if (typeof filter.value === "string" && filter.value.trim()) {
              params.date_issued = filter.value.trim();
            }
            break;
          // requirement_number is not in the query params interface, so skip it
        }
      });

      return params;
    },
    []
  );

  const queryParams: InspectionRequirementGridQueryParams = useMemo(
    () => ({
      page: pagination.pageIndex + 1,
      per_page: pagination.pageSize,
      ...convertFiltersToQueryParams(columnFilters),
      ...(globalFilter && { global_search: globalFilter }),
    }),
    [
      pagination.pageIndex,
      pagination.pageSize,
      columnFilters,
      globalFilter,
      convertFiltersToQueryParams,
    ]
  );

  const { data, isLoading } = useInspectionRequirementsGrid(queryParams);
  const requirementsList = useMemo(() => data?.items ?? [], [data]);

  const handlePaginationChange = useCallback(
    (
      updater:
        | MRT_TableState<InspectionRequirementGrid>["pagination"]
        | ((
            old: MRT_TableState<InspectionRequirementGrid>["pagination"]
          ) => MRT_TableState<InspectionRequirementGrid>["pagination"])
    ) => {
      setPagination(updater);
    },
    []
  );

  const handleColumnFiltersChange = useCallback(
    (
      updater:
        | MRT_TableState<InspectionRequirementGrid>["columnFilters"]
        | ((
            old: MRT_TableState<InspectionRequirementGrid>["columnFilters"]
          ) => MRT_TableState<InspectionRequirementGrid>["columnFilters"])
    ) => {
      setColumnFilters(updater);
      // Reset to first page when filters change
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    },
    []
  );

  const handleGlobalFilterChange = useCallback(
    (
      updater:
        | MRT_TableState<InspectionRequirementGrid>["globalFilter"]
        | ((
            old: MRT_TableState<InspectionRequirementGrid>["globalFilter"]
          ) => MRT_TableState<InspectionRequirementGrid>["globalFilter"])
    ) => {
      setGlobalFilter(updater);
      // Reset to first page when global filter changes
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    },
    []
  );

  const columns = useMemo<MRT_ColumnDef<InspectionRequirementGrid>[]>(
    () => [
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
              label={row.original.approval_status}
              color={
                row.original.approval_status === "Pending"
                  ? "warning"
                  : row.original.approval_status === "Approved"
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
        filterSelectOptions: [
          ...new Set(
            requirementsList?.map((req) => req.approval_status).filter(Boolean)
          ),
        ],
        size: 120,
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
        size: 150,
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
        accessorFn: (row) => dateUtils.formatDate(row.date_issued),
        id: "date_issued",
        header: "IR Issuance Date",
        filterFn: "contains",
        size: 120,
      },
    ],
    [
      requirementsList,
      topics,
      complianceFindings,
      enforcementActions,
      requirementSources,
    ]
  );

  return isLoading ? (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100%"
    >
      <CircularProgress size={60} />
    </Box>
  ) : (
    <MasterDataTable
      columns={columns}
      data={requirementsList ?? []}
      initialState={{
        sorting: [{ id: "topic", desc: false }],
      }}
      state={{
        isLoading,
        showGlobalFilter: true,
        pagination,
        columnFilters,
        globalFilter,
      }}
      titleToolbarProps={{
        tableTitle: "Requirements",
      }}
      remoteDataConfig={{
        enableRemoteData: true,
        rowCount: data?.total,
        onPaginationChange: handlePaginationChange,
        onColumnFiltersChange: handleColumnFiltersChange,
        onGlobalFilterChange: handleGlobalFilterChange,
      }}
    />
  );
}
