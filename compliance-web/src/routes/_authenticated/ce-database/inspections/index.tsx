import CustomSwitch from "@/components/Shared/Controlled/CustomSwitch";
import MasterDataTable from "@/components/Shared/MasterDataTable/MasterDataTable";
import PageLink from "@/components/Shared/PageLink";
import { useInspectionsData } from "@/hooks/useInspections";
import { useStaffUsersData } from "@/hooks/useStaff";
import { Inspection } from "@/models/Inspection";
import {
  APPROVAL_STATUS,
  APPROVAL_STATUS_TEXT,
  STAFF_USER_POSITION,
} from "@/utils/constants";
import dateUtils from "@/utils/dateUtils";
import {
  Box,
  Chip,
  CircularProgress,
  FormControlLabel,
  Typography,
} from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { MRT_ColumnDef, MRT_TableInstance } from "material-react-table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "react-oidc-context";

export const Route = createFileRoute(
  "/_authenticated/ce-database/inspections/"
)({ component: Inspections });

export function Inspections() {
  const { data: inspectionsList, isLoading } = useInspectionsData();
  const { data: staffList, isLoading: staffLoading } = useStaffUsersData(true);
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const [showOnlyMyInspections, setShowOnlyMyInspections] = useState(false);
  const [tableInstance, setTableInstance] = useState<
    MRT_TableInstance<Inspection> | undefined
  >();

  // Find current user from staff list
  const currentUserStaff = useMemo(() => {
    return staffList?.find(
      (staff) =>
        staff.auth_user_guid === currentUser?.profile?.preferred_username
    );
  }, [staffList, currentUser?.profile?.preferred_username]);

  // Check if current user is a deputy director
  const isCurrentUserDeputy = useMemo(() => {
    return (
      currentUserStaff?.position_id === STAFF_USER_POSITION.DEPUTY_DIRECTOR
    );
  }, [currentUserStaff?.position_id]);

  // Check if current user has primary inspections
  const isCurrentUserHasPrimary = useMemo(() => {
    return inspectionsList?.some(
      (inspection) =>
        inspection.primary_officer?.auth_user_guid ===
        currentUser?.profile?.preferred_username
    );
  }, [inspectionsList, currentUser?.profile?.preferred_username]);

  // Check if deputy has pending approvals
  const isDeputyReviewPending = useMemo(() => {
    if (!isCurrentUserDeputy) return false;
    return inspectionsList?.some(
      (inspection) =>
        inspection.approval_status?.id === APPROVAL_STATUS.APPROVAL_PENDING &&
        inspection.approved_by_id === currentUserStaff?.id
    );
  }, [inspectionsList, isCurrentUserDeputy, currentUserStaff?.id]);

  // Helper function to apply filters based on user role
  const applyUserSpecificFilters = useCallback(
    (table: MRT_TableInstance<Inspection>) => {
      if (isCurrentUserDeputy && isDeputyReviewPending) {
        table.setColumnFilters([
          {
            id: "approval_status",
            value: [APPROVAL_STATUS_TEXT.APPROVAL_PENDING],
          },
        ]);
      } else if (isCurrentUserHasPrimary) {
        table.setColumnFilters([
          {
            id: "primary_officer.name",
            value: [currentUser?.profile?.name],
          },
        ]);
      }
    },
    [
      isCurrentUserDeputy,
      isDeputyReviewPending,
      isCurrentUserHasPrimary,
      currentUser?.profile?.name,
    ]
  );

  // Helper function to clear all filters
  const clearAllFilters = useCallback(
    (table: MRT_TableInstance<Inspection>) => {
      table.setColumnFilters([]);
    },
    []
  );

  const createUniqueFilterList = useCallback(
    (key: keyof Inspection, subKey?: string): string[] => {
      return [
        ...new Set(
          inspectionsList?.map((item) => {
            const value = item[key];
            if (typeof value === "object" && value !== null) {
              if (subKey && subKey in value) {
                return (value as unknown as Record<string, unknown>)[
                  subKey
                ] as string;
              }
              return "";
            }
            return typeof value === "string" ? value : "";
          })
        ),
      ].filter(Boolean) as string[];
    },
    [inspectionsList]
  );

  const projectList = useMemo(
    () =>
      [
        ...new Set(
          inspectionsList?.map((ins) => ins.case_file?.project?.name ?? "")
        ),
      ].filter(Boolean),
    [inspectionsList]
  );
  const initiationList = useMemo(
    () => createUniqueFilterList("initiation", "name"),
    [createUniqueFilterList]
  );
  const staffUserList = useMemo(
    () => createUniqueFilterList("primary_officer", "name"),
    [createUniqueFilterList]
  );
  const inspectionStatusList = useMemo(
    () => createUniqueFilterList("inspection_status"),
    [createUniqueFilterList]
  );
  const irProgressList = useMemo(
    () => createUniqueFilterList("ir_progress", "name"),
    [createUniqueFilterList]
  );
  const approvalStatusList = useMemo(
    () => createUniqueFilterList("approval_status", "name"),
    [createUniqueFilterList]
  );

  const columns = useMemo<MRT_ColumnDef<Inspection>[]>(
    () => [
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
      },
      {
        accessorFn: (row) => row.case_file?.project?.name,
        header: "Project",
        filterVariant: "multi-select",
        filterSelectOptions: projectList,
      },
      {
        accessorFn: (row) => dateUtils.formatDate(row.start_date),
        id: "start_date",
        header: "Start Date",
        filterFn: "contains",
        size: 120,
      },
      {
        accessorFn: (row) => row.initiation?.name,
        id: "initiation",
        header: "Initiation",
        filterVariant: "multi-select",
        filterSelectOptions: initiationList,
        size: 120,
      },
      {
        accessorFn: (row) => row.ir_progress?.name,
        id: "ir_progress",
        header: "IR Progress",
        filterVariant: "multi-select",
        filterSelectOptions: irProgressList,
        size: 120,
      },
      {
        accessorFn: (row) => row.approval_status?.name,
        id: "approval_status",
        header: "Approval Status",
        Cell: ({ row }) => {
          return row.original.approval_status ? (
            <Chip
              label={row.original.approval_status?.name}
              color={
                row.original.approval_status?.id === APPROVAL_STATUS.APPROVAL_PENDING
                  ? "warning"
                  : row.original.approval_status?.id === APPROVAL_STATUS.APPROVED
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
        filterSelectOptions: approvalStatusList,
        size: 120,
      },
      {
        accessorFn: (row) => row.primary_officer?.name,
        id: "primary_officer.name",
        header: "Primary",
        filterVariant: "multi-select",
        filterSelectOptions: staffUserList,
        size: 120,
      },
      {
        accessorKey: "inspection_status",
        header: "Status",
        Cell: ({ row }) => {
          return row.original.inspection_status ? (
            <Chip
              label={row.original.inspection_status}
              color={
                row.original.inspection_status?.toLowerCase() === "open"
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
        filterSelectOptions: inspectionStatusList,
        size: 80,
      },
      {
        accessorFn: (row) => row.case_file?.case_file_number,
        header: "Case File #",
        filterFn: "contains",
        Cell: ({ row }) => (
          <PageLink
            to="/ce-database/case-files/$caseFileNumber"
            params={{
              caseFileNumber: row.original.case_file?.case_file_number,
            }}
          />
        ),
      },
    ],
    [
      projectList,
      initiationList,
      irProgressList,
      approvalStatusList,
      staffUserList,
      inspectionStatusList,
    ]
  );

  useEffect(() => {
    if (isCurrentUserDeputy && isDeputyReviewPending) {
      setShowOnlyMyInspections(true);
      if (tableInstance) {
        applyUserSpecificFilters(tableInstance);
      }
    } else if (isCurrentUserHasPrimary) {
      setShowOnlyMyInspections(true);
      if (tableInstance) {
        applyUserSpecificFilters(tableInstance);
      }
    }
  }, [
    inspectionsList,
    currentUser,
    tableInstance,
    currentUserStaff,
    isCurrentUserDeputy,
    isDeputyReviewPending,
    isCurrentUserHasPrimary,
    applyUserSpecificFilters,
  ]);

  const renderExternalFilter = useCallback(
    ({ table }: { table: MRT_TableInstance<Inspection> }) => {
      return (
        <FormControlLabel
          control={
            <CustomSwitch
              checked={showOnlyMyInspections}
              onChange={(e) => {
                setShowOnlyMyInspections(e.target.checked);
                if (e.target.checked) {
                  applyUserSpecificFilters(table);
                } else {
                  clearAllFilters(table);
                }
              }}
              size="small"
            />
          }
          label={
            <Typography variant="body1" mr={1}>
              <strong>{currentUser?.profile?.given_name}</strong>'s Files
              {isCurrentUserDeputy && " for Review"}
            </Typography>
          }
          labelPlacement="start"
        />
      );
    },
    [
      showOnlyMyInspections,
      currentUser?.profile?.given_name,
      isCurrentUserDeputy,
      applyUserSpecificFilters,
      clearAllFilters,
    ]
  );

  return authLoading || staffLoading ? (
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
      data={inspectionsList ?? []}
      setTableInstance={setTableInstance}
      initialState={{
        sorting: [{ id: "ir_number", desc: false }],
      }}
      state={{
        isLoading,
        showGlobalFilter: true,
      }}
      titleToolbarProps={{
        tableTitle: "Inspections",
      }}
      renderExternalFilter={renderExternalFilter}
    />
  );
}
