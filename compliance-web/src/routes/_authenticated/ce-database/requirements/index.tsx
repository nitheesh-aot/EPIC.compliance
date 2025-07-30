import MasterDataTable from "@/components/Shared/MasterDataTable/MasterDataTable";
import PageLink from "@/components/Shared/PageLink";
import { useRequirementSourcesData } from "@/hooks/useComplaints";
import {
  useComplianceFindingsData,
  useEnforcementActionsData,
} from "@/hooks/useInspectionRequirements";
import {
  useInspectionRequirementExport,
  useInspectionRequirementsGrid,
} from "@/hooks/useInspectionRequirementsGrid";
import { useTopicsData } from "@/hooks/useTopics";
import {
  InspectionRequirementGrid,
  InspectionRequirementGridQueryParams,
} from "@/models/InspectionRequirementGrid";
import {
  APPROVAL_STATUS,
  APPROVAL_STATUS_TEXT,
  STAFF_USER_POSITION,
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
import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import RequirementsExternalFilters from "@/components/App/RequirementsGrid/RequirementsExternalFilters";
import ShowOnlyMyRequirementsSwitch from "@/components/App/RequirementsGrid/ShowOnlyMyRequirementsSwitch";
import { downloadFile } from "@/utils/appUtils";
import { useStaffUsersData } from "@/hooks/useStaff";
import { cachedFiltersStore } from "@/store/cachedFiltersStore";
import { AppConfig } from "@/utils/config";
import { useAuth } from "react-oidc-context";

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
  const { user: currentUser } = useAuth();
  const [showOnlyMyRequirements, setShowOnlyMyRequirements] = useState(false);

  // Find current user from staff list
  const currentUserStaff = useMemo(() => {
    return staffUsers?.find(
      (staff) =>
        staff.auth_user_guid === currentUser?.profile?.preferred_username
    );
  }, [staffUsers, currentUser?.profile?.preferred_username]);

  // Check if current user is a deputy director
  const isCurrentUserDeputy = useMemo(() => {
    return (
      currentUserStaff?.position_id === STAFF_USER_POSITION.DEPUTY_DIRECTOR
    );
  }, [currentUserStaff?.position_id]);

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

  // Apply column filters for deputy directors when switch state is restored
  useEffect(() => {
    if (isRestored && showOnlyMyRequirements && isCurrentUserDeputy && currentUserStaff) {
      // Apply column filters for deputy directors when restored
      const currentUserStaffName = currentUserStaff.name;
      const deputyFilters = [
        {
          id: "reviewer",
          value: [currentUserStaffName],
        },
        {
          id: "approval_status",
          value: [APPROVAL_STATUS.APPROVAL_PENDING],
        },
      ];

      // Remove existing user-specific filters and add new ones
      const filteredFilters = columnFilters.filter(
        (filter) =>
          filter.id !== "reviewer" && filter.id !== "approval_status"
      );
      setColumnFilters([...filteredFilters, ...deputyFilters]);
    } else if (isRestored && !showOnlyMyRequirements) {
      // Remove user-specific filters when switch is turned off
      const filteredFilters = columnFilters.filter(
        (filter) =>
          filter.id !== "reviewer" && filter.id !== "approval_status"
      );
      setColumnFilters(filteredFilters);
    }
  }, [isRestored, showOnlyMyRequirements, isCurrentUserDeputy, currentUserStaff, columnFilters]);

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

  // Convert column filters to API query parameters
  const convertFiltersToQueryParams = useCallback(
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
              params.apprv_sts = Array.isArray(value)
                ? value.join(",")
                : value;
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

  const { mutate: downloadRequirementExport } = useInspectionRequirementExport(
    (data) => {
      downloadFile(
        data,
        `requirements-${dateUtils.formatDate(new Date().toISOString(), "YYYY-MM-DD-HH-mm-ss")}.xlsx`
      );
    }
  );

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

  // Helper function to apply user-specific column filters for UI display
  const applyUserSpecificColumnFilters = useCallback(
    (checked: boolean, staffId?: number) => {
      if (checked && staffId && isCurrentUserDeputy) {
        // For deputy directors, apply both reviewer and approval status filters for UI display
        const currentUserStaff = staffUsers?.find(staff => staff.id === staffId);
        const deputyFilters = [
          {
            id: "reviewer",
            value: [currentUserStaff?.name || ""],
          },
          {
            id: "approval_status",
            value: [APPROVAL_STATUS.APPROVAL_PENDING],
          },
        ];

        // Remove existing user-specific filters and add new ones
        const filteredFilters = columnFilters.filter(
          (filter) =>
            filter.id !== "reviewer" && filter.id !== "approval_status"
        );
        setColumnFilters([...filteredFilters, ...deputyFilters]);
      } else if (!checked) {
        // Remove user-specific filters when turning off
        const filteredFilters = columnFilters.filter(
          (filter) =>
            filter.id !== "reviewer" && filter.id !== "approval_status"
        );
        setColumnFilters(filteredFilters);
      }
    },
    [columnFilters, isCurrentUserDeputy, staffUsers]
  );

  // Handler for the switch
  const handleShowOnlyMyRequirementsChange = useCallback(
    (checked: boolean, staffId?: number) => {
      setShowOnlyMyRequirements(checked);
      
      // Apply column filters for deputy directors
      applyUserSpecificColumnFilters(checked, staffId);
      
      // Apply external filters
      setExternalFilters((prev) => {
        const newFilters = { ...prev };
        if (checked && staffId) {
          if (isCurrentUserDeputy) {
            // For deputy directors, filter by both reviewer and approval status
            newFilters.reviewer_ids = [staffId.toString()];
            newFilters.approval_status = [APPROVAL_STATUS.APPROVAL_PENDING];
          } else {
            // For regular users, filter by primary officer
            newFilters.primary_officer_id = [staffId.toString()];
          }
        } else {
          delete newFilters.primary_officer_id;
          delete newFilters.reviewer_ids;
          delete newFilters.approval_status;
        }
        return newFilters;
      });
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    },
    [isCurrentUserDeputy, applyUserSpecificColumnFilters]
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
        accessorKey: "approved_by_id",
        header: "Approved By ID",
        enableHiding: true,
        enableColumnFilter: true,
        filterVariant: "multi-select",
        accessorFn: (row) => row.approved_by_id?.toString() ?? "",
        muiTableHeadCellProps: {
          sx: { display: "none" },
        },
        muiTableBodyCellProps: {
          sx: { display: "none" },
        },
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
    ],
    [
      topics,
      complianceFindings,
      enforcementActions,
      requirementSources,
      approvalStatusOptions,
      staffUsers,
    ]
  );

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
              checked={showOnlyMyRequirements}
              onChange={handleShowOnlyMyRequirementsChange}
              disabled={isLoading || (isCurrentUserDeputy && !currentUserStaff)}
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
              <Button
                variant="text"
                size="small"
                startIcon={<FileDownloadRounded />}
                sx={{ ml: -2 }}
                onClick={() => downloadRequirementExport(queryParams)}
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
