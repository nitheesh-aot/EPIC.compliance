import MasterDataTable from "@/components/Shared/MasterDataTable/MasterDataTable";
import { useRequirementSourcesData } from "@/hooks/useComplaints";
import {
  useComplianceFindingsData,
  useEnforcementActionsData,
} from "@/hooks/useInspectionRequirements";
import {
  useInspectionRequirementsGrid,
} from "@/hooks/useInspectionRequirementsGrid";
import { useTopicsData } from "@/hooks/useTopics";
import {
  InspectionRequirementGrid,
  InspectionRequirementGridQueryParams,
} from "@/models/InspectionRequirementGrid";
import { APPROVAL_STATUS_TEXT } from "@/utils/constants";
import { Box, CircularProgress, Typography } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { BCDesignTokens } from "epic.theme";
import { MRT_TableState } from "material-react-table";
import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import RequirementsExternalFilters from "@/components/App/RequirementsGrid/RequirementsExternalFilters";
import ShowOnlyMyRequirementsSwitch from "@/components/App/RequirementsGrid/ShowOnlyMyRequirementsSwitch";
import RequirementsGridPagination from "@/components/App/RequirementsGrid/RequirementsGridPagination";
import RequirementsGridExport from "@/components/App/RequirementsGrid/RequirementsGridExport";
import {
  useConvertFiltersToQueryParams,
  useRequirementsGridColumns,
} from "@/components/App/RequirementsGrid/RequirementsGridUtils";
import { useStaffUsersData } from "@/hooks/useStaff";
import { cachedFiltersStore } from "@/store/cachedFiltersStore";
import { AppConfig } from "@/utils/config";

export const Route = createFileRoute(
  "/_authenticated/ce-database/requirements/"
)({
  component: Requirements,
});

const requirementsColumnFiltersCacheKey = "requirements-column-filters";

function Requirements() {
  const { data: topics } = useTopicsData();
  const { data: complianceFindings } = useComplianceFindingsData();
  const { data: enforcementActions } = useEnforcementActionsData();
  const { data: requirementSources } = useRequirementSourcesData();
  const { data: staffUsers } = useStaffUsersData();
  const [showOnlyMyRequirements, setShowOnlyMyRequirements] = useState(false);

  const approvalStatusOptions = Object.entries(APPROVAL_STATUS_TEXT).map(
    ([id, name]) => ({
      id,
      name,
    })
  );
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: AppConfig.defaultPageSize,
  });

  const [columnFilters, setColumnFilters] = useState<
    MRT_TableState<InspectionRequirementGrid>["columnFilters"]
  >([]);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [externalFilters, setExternalFilters] = useState<
    Record<string, string[] | string>
  >({});

  // Track if we're in the initial load phase to prevent caching during restoration
  const isInitialLoad = useRef(true);
  const [isRestored, setIsRestored] = useState(false);

  // Track previous values to prevent unnecessary caching
  const prevFilters = useRef<{
    columnFilters: MRT_TableState<InspectionRequirementGrid>["columnFilters"];
    externalFilters: Record<string, string[] | string>;
    showOnlyMyRequirements: boolean;
    globalFilter: string;
  }>({
    columnFilters: [],
    externalFilters: {},
    showOnlyMyRequirements: false,
    globalFilter: "",
  });

  // Get cached filters store methods
  const { getFilters, getExternalFilters } = cachedFiltersStore();
  const cachedColumnFilters = getFilters(requirementsColumnFiltersCacheKey);
  const cachedExternalFilters = getExternalFilters(
    requirementsColumnFiltersCacheKey
  );

  // Restore cached filters on component mount
  useEffect(() => {
    // Reset the initial load flag on every mount
    isInitialLoad.current = true;

    if (cachedColumnFilters.length > 0) {
      setColumnFilters(cachedColumnFilters);
    }
    if (cachedExternalFilters) {
      const restoredExternalFilters = cachedExternalFilters as Record<
        string,
        string[] | string
      >;
      setExternalFilters(restoredExternalFilters);

      // Restore showOnlyMyRequirements state if it was cached
      if (restoredExternalFilters.showOnlyMyRequirements !== undefined) {
        const showOnlyMyRequirementsValue =
          restoredExternalFilters.showOnlyMyRequirements;
        if (typeof showOnlyMyRequirementsValue === "boolean") {
          setShowOnlyMyRequirements(showOnlyMyRequirementsValue);
        }
      } else if (
        restoredExternalFilters.primary_officer_id ||
        restoredExternalFilters.reviewer_ids ||
        restoredExternalFilters.approval_status
      ) {
        // Legacy support - if primary_officer_id, reviewer_ids, or approval_status exists, set showOnlyMyRequirements to true
        setShowOnlyMyRequirements(true);
      }

      // Restore global filter if it was cached
      if (restoredExternalFilters.globalFilter) {
        setGlobalFilter(restoredExternalFilters.globalFilter as string);
      }
    }

    // Mark restoration as complete and initial load as complete
    isInitialLoad.current = false;
    setIsRestored(true);
  }, [cachedColumnFilters, cachedExternalFilters]);

  // Cache all filters when they change (but not during initial load)
  useEffect(() => {
    if (!isInitialLoad.current) {
      // Check if any values have actually changed
      const currentFilters = {
        columnFilters,
        externalFilters,
        showOnlyMyRequirements,
        globalFilter,
      };

      const hasChanged =
        JSON.stringify(currentFilters) !== JSON.stringify(prevFilters.current);

      if (hasChanged) {
        cachedFiltersStore
          .getState()
          .setFilters(requirementsColumnFiltersCacheKey, columnFilters, {
            ...externalFilters,
            showOnlyMyRequirements,
            globalFilter,
          });

        // Update previous values
        prevFilters.current = currentFilters;
      }
    }
  }, [columnFilters, externalFilters, showOnlyMyRequirements, globalFilter]);

  // Use the extracted utility function
  const convertFiltersToQueryParams =
    useConvertFiltersToQueryParams(externalFilters);

  const queryParams: InspectionRequirementGridQueryParams = useMemo(
    () => ({
      page_no: pagination.pageIndex + 1,
      page_size: pagination.pageSize,
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

  const handleClearAllFilters = useCallback(() => {
    setExternalFilters({});
    setColumnFilters([]);
    setGlobalFilter("");
    setShowOnlyMyRequirements(false);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, []);

  // Handler for the switch filter changes
  const handleShowOnlyMyRequirementsFiltersChange = useCallback(
    (filters: {
      checked: boolean;
      externalFilters: Record<string, string[] | string>;
      columnFilters?: MRT_TableState<InspectionRequirementGrid>["columnFilters"];
    }) => {
      setShowOnlyMyRequirements(filters.checked);

      // Apply external filters
      Object.entries(filters.externalFilters).forEach(([key, value]) => {
        setExternalFilters((prev) => ({
          ...prev,
          [key]: value,
        }));
      });

      // Reset pagination
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    },
    []
  );

  // Use the extracted utility function for columns
  const columns = useRequirementsGridColumns({
    topics,
    complianceFindings,
    enforcementActions,
    requirementSources,
    approvalStatusOptions,
    staffUsers,
  });

  return isLoading || !isRestored ? (
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
        columnFilters: isRestored ? columnFilters : [],
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
            gap: 2,
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
            <ShowOnlyMyRequirementsSwitch
              initialChecked={showOnlyMyRequirements}
              onFiltersChange={handleShowOnlyMyRequirementsFiltersChange}
              disabled={isLoading}
              columnFilters={columnFilters}
              onColumnFiltersChange={handleColumnFiltersChange}
            />
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
              <RequirementsGridExport queryParams={queryParams} />
              <RequirementsGridPagination
                table={table}
                totalCount={data?.total || 0}
              />
            </Box>

            {/* Right side - Filters */}
            <RequirementsExternalFilters
              onFilterChange={handleExternalFilterChange}
              onClearAll={handleClearAllFilters}
              externalFilters={externalFilters}
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
