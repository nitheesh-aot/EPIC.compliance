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
import {
  APPROVAL_STATUS,
  APPROVAL_STATUS_TEXT,
  DEFAULT_PAGE_SIZE,
} from "@/utils/constants";
import dateUtils from "@/utils/dateUtils";
import {
  ChevronLeftRounded,
  ChevronRightRounded,
  FileDownloadRounded,
} from "@mui/icons-material";
import {
  Box,
  Chip,
  CircularProgress,
  Typography,
  Button,
  IconButton,
} from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { BCDesignTokens } from "epic.theme";
import { MRT_ColumnDef, MRT_TableState } from "material-react-table";
import { useMemo, useState, useCallback } from "react";
import RequirementsExternalFilters from "@/components/App/RequirementsGrid/RequirementsExternalFilters";

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

  const approvalStatusOptions = Object.entries(APPROVAL_STATUS_TEXT).map(
    ([id, name]) => ({
      id,
      name,
    })
  );
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  });

  const [columnFilters, setColumnFilters] = useState<
    MRT_TableState<InspectionRequirementGrid>["columnFilters"]
  >([]);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [externalFilters, setExternalFilters] = useState<
    Record<string, string[] | string>
  >({});

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

      // Add external filters
      Object.entries(externalFilters).forEach(([key, value]) => {
        if (value && (Array.isArray(value) ? value.length > 0 : value !== "")) {
          switch (key) {
            case "primary_officer_id":
              params.primary_officer_id = Array.isArray(value)
                ? parseInt(value[0])
                : parseInt(value);
              break;
            case "inspection_status":
              params.inspection_status = Array.isArray(value)
                ? value[0]
                : value;
              break;
            case "project_id":
              params.project_id = Array.isArray(value)
                ? parseInt(value[0])
                : parseInt(value);
              break;
          }
        }
      });

      return params;
    },
    [externalFilters]
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
      const newFilters =
        typeof updater === "function" ? updater(columnFilters) : updater;

      // Only reset pagination if filters actually changed
      const filtersChanged =
        JSON.stringify(newFilters) !== JSON.stringify(columnFilters);

      setColumnFilters(updater);

      if (filtersChanged) {
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
      }
    },
    [columnFilters]
  );

  const handleGlobalFilterChange = useCallback(
    (
      updater:
        | MRT_TableState<InspectionRequirementGrid>["globalFilter"]
        | ((
            old: MRT_TableState<InspectionRequirementGrid>["globalFilter"]
          ) => MRT_TableState<InspectionRequirementGrid>["globalFilter"])
    ) => {
      const newGlobalFilter =
        typeof updater === "function" ? updater(globalFilter) : updater;

      // Only reset pagination if global filter actually changed
      const globalFilterChanged = newGlobalFilter !== globalFilter;

      setGlobalFilter(updater);

      if (globalFilterChanged) {
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
      }
    },
    [globalFilter]
  );

  const handleExternalFilterChange = useCallback(
    (filterId: string, value: string[] | string) => {
      setExternalFilters((prev) => ({
        ...prev,
        [filterId]: value,
      }));
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
        accessorFn: (row) =>
          row.date_issued ? dateUtils.formatDate(row.date_issued) : "",
        id: "date_issued",
        header: "IR Issuance Date",
        filterFn: "contains",
        size: 120,
      },
    ],
    [
      topics,
      complianceFindings,
      enforcementActions,
      requirementSources,
      approvalStatusOptions,
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
      enableSorting={false}
      enablePagination={false}
      hideFilterToggle={true}
      renderTopToolbarCustomActions={({ table }) => (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            width: "100%",
            mr: -1,
          }}
        >
          {/* Title section with toggle */}
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <Typography
              variant="h5"
              sx={{ color: BCDesignTokens.typographyColorLink }}
            >
              Requirements
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              files for review should be here
            </Box>
          </Box>

          {/* Pagination and controls section */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            {/* Left side - Export button */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Button
                variant="text"
                size="small"
                startIcon={<FileDownloadRounded />}
                sx={{ ml: -2 }}
              >
                Export as Excel
              </Button>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  justifyContent: "center",
                }}
              >
                <Typography variant="body1">
                  {table.getState().pagination.pageIndex *
                    table.getState().pagination.pageSize +
                    1}{" "}
                  to{" "}
                  {Math.min(
                    (table.getState().pagination.pageIndex + 1) *
                      table.getState().pagination.pageSize,
                    data?.total || 0
                  )}{" "}
                  of {data?.total || 0}
                </Typography>
                <IconButton
                  aria-label="page_back"
                  size="small"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronLeftRounded fontSize="small" />
                </IconButton>
                <IconButton
                  aria-label="page_forward"
                  size="small"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronRightRounded fontSize="small" />
                </IconButton>
              </Box>
            </Box>

            {/* Right side - Filters */}
            <RequirementsExternalFilters
              onFilterChange={handleExternalFilterChange}
            />
          </Box>
        </Box>
      )}
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
