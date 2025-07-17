import MasterDataTable from "@/components/Shared/MasterDataTable/MasterDataTable";
import PageLink from "@/components/Shared/PageLink";
import { useInspectionRequirementsGrid } from "@/hooks/useInspectionRequirementsGrid";
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
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  });

  const queryParams: InspectionRequirementGridQueryParams = useMemo(
    () => ({
      page: pagination.pageIndex + 1,
      per_page: pagination.pageSize,
    }),
    [pagination.pageIndex, pagination.pageSize]
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

  const columns = useMemo<MRT_ColumnDef<InspectionRequirementGrid>[]>(
    () => [
      {
        accessorFn: (row) => row.topic?.name,
        id: "topic",
        header: "Topic",
        filterVariant: "multi-select",
        filterSelectOptions: [
          ...new Set(
            requirementsList?.map((req) => req.topic?.name).filter(Boolean)
          ),
        ],
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
        filterSelectOptions: [
          ...new Set(
            requirementsList
              ?.map((req) => req.compliance_finding?.name)
              .filter(Boolean)
          ),
        ],
        size: 80,
      },
      {
        accessorFn: (row) => row.enforcement_action?.name,
        id: "enforcement_action",
        header: "Enforcement Action",
        filterVariant: "multi-select",
        filterSelectOptions: [
          ...new Set(
            requirementsList
              ?.map((req) => req.enforcement_action?.name)
              .filter(Boolean)
          ),
        ],
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
        filterSelectOptions: [
          ...new Set(
            requirementsList
              ?.map((req) => req.requirement_source?.name)
              .filter(Boolean)
          ),
        ],
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
    [requirementsList]
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
      }}
      titleToolbarProps={{
        tableTitle: "Requirements",
      }}
      remoteDataConfig={{
        enableRemoteData: true,
        rowCount: data?.total,
        onPaginationChange: handlePaginationChange,
      }}
    />
  );
}
