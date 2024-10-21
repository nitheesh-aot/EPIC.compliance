import TableFilter from "@/components/Shared/FilterSelect/TableFilter";
import MasterDataTable from "@/components/Shared/MasterDataTable/MasterDataTable";
import { searchFilter } from "@/components/Shared/MasterDataTable/utils";
import { useInspectionsByCaseFileId } from "@/hooks/useInspections";
import { Inspection } from "@/models/Inspection";
import { Link, Chip } from "@mui/material";
import { Link as RouterLink } from "@tanstack/react-router";
import { MRT_ColumnDef } from "material-react-table";
import { useState, useEffect, useMemo } from "react";

const CaseFileInspectionsTable = ({ caseFileId }: { caseFileId: number }) => {
  const { data: inspections, isLoading } =
    useInspectionsByCaseFileId(caseFileId);

  const [staffUserList, setStaffUserList] = useState<string[]>([]);
  const [inspectionStatusList, setInspectionStatusList] = useState<string[]>(
    []
  );

  useEffect(() => {
    setStaffUserList(
      [
        ...new Set(
          inspections?.map((insp) => insp.lead_officer?.full_name ?? "")
        ),
      ].filter(Boolean)
    );
    setInspectionStatusList(
      [
        ...new Set(inspections?.map((insp) => insp.inspection_status ?? "")),
      ].filter(Boolean)
    );
  }, [inspections]);

  const columns = useMemo<MRT_ColumnDef<Inspection>[]>(
    () => [
      {
        accessorKey: "ir_number",
        header: "IR #",
        sortingFn: "sortFn",
        filterFn: searchFilter,
        Cell: ({ row }) => {
          return (
            <Link
              component={RouterLink}
              to="/ce-database/inspections/$inspectionNumber"
              params={{
                inspectionNumber: row.original.ir_number,
              }}
              underline="hover"
            >
              {row.original.ir_number?.split("_").pop()}
            </Link>
          );
        },
        size: 70,
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
        Filter: ({ header, column }) => {
          return (
            <TableFilter
              isMulti
              header={header}
              column={column}
              variant="inline"
              name="inspectionStatusFilter"
              placeholder="Filter"
            />
          );
        },
        size: 100,
      },
      // TODO: Add map correct values for the next 3 columns
      {
        accessorKey: "subtopic",
        header: "Subtopic",
        size: 120,
      },
      {
        accessorKey: "source",
        header: "Source",
        size: 120,
      },
      {
        accessorKey: "enforcement",
        header: "Enforcement",
        size: 120,
      },
      {
        accessorFn: (row) => row.lead_officer?.full_name,
        id: "lead_officer.full_name",
        header: "Lead Officer",
        filterVariant: "multi-select",
        filterSelectOptions: staffUserList,
        Filter: ({ header, column }) => {
          return (
            <TableFilter
              isMulti
              header={header}
              column={column}
              variant="inline"
              name="leadOfficersFilter"
              placeholder="Filter"
            />
          );
        },
        size: 120,
      },
    ],
    [inspectionStatusList, staffUserList]
  );

  return (
    <MasterDataTable
      columns={columns}
      data={inspections ?? []}
      initialState={{
        sorting: [
          {
            id: "ir_number",
            desc: false,
          },
        ],
      }}
      state={{
        isLoading: isLoading,
        showGlobalFilter: true,
      }}
      enableTopToolbar={false}
    />
  );
};

export default CaseFileInspectionsTable;
