import TableFilter from "@/components/Shared/FilterSelect/TableFilter";
import MasterDataTable from "@/components/Shared/MasterDataTable/MasterDataTable";
import { searchFilter } from "@/components/Shared/MasterDataTable/utils";
import { useComplaintsByCaseFileId } from "@/hooks/useComplaints";
import { Complaint } from "@/models/Complaint";
import { Link, Chip } from "@mui/material";
import { Link as RouterLink } from "@tanstack/react-router";
import { MRT_ColumnDef } from "material-react-table";
import { useState, useEffect, useMemo } from "react";

const CaseFileComplaintsTable = ({ caseFileId }: { caseFileId: number }) => {
  const { data: complaints, isLoading } =
    useComplaintsByCaseFileId(caseFileId);

  const [staffUserList, setStaffUserList] = useState<string[]>([]);
  const [complaintStatusList, setComplaintStatusList] = useState<string[]>([]);
  const [topicList, setTopicList] = useState<string[]>([]);
  const [complaintSourceList, setComplaintSourceList] = useState<string[]>([]);

  useEffect(() => {
    setStaffUserList(
      [
        ...new Set(
          complaints?.map((complaint) => complaint.primary_officer?.full_name ?? "")
        ),
      ].filter(Boolean)
    );
    setComplaintStatusList(
      [
        ...new Set(complaints?.map((complaint) => complaint.status ?? "")),
      ].filter(Boolean)
    );
    setTopicList(
      [
        ...new Set(complaints?.map((complaint) => complaint.requirement_detail?.topic?.name ?? "")),
      ].filter(Boolean)
    );
    setComplaintSourceList(
      [
        ...new Set(complaints?.map((complaint) => complaint.source_type?.name ?? "")),
      ].filter(Boolean)
    );
  }, [complaints]);

  const columns = useMemo<MRT_ColumnDef<Complaint>[]>(
    () => [
      {
        accessorKey: "complaint_number",
        header: "Complaint #",
        sortingFn: "sortFn",
        filterFn: searchFilter,
        Cell: ({ row }) => {
          return (
            <Link
              component={RouterLink}
              to={`/ce-database/complaints/${row.original.complaint_number}`}
              underline="hover"
            >
              {row.original.complaint_number?.split("_").pop()}
            </Link>
          );
        },
        size: 100,
      },
      {
        accessorKey: "status",
        header: "Status",
        Cell: ({ row }) => {
          return row.original.status ? (
            <Chip
              label={row.original.status}
              color={
                row.original.status?.toLowerCase() === "open"
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
        filterSelectOptions: complaintStatusList,
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
      {
        accessorFn: (row) => row.requirement_detail?.topic?.name,
        header: "Topic",
        filterVariant: "multi-select",
        filterSelectOptions: topicList,
        Filter: ({ header, column }) => {
          return (
            <TableFilter
              isMulti
              header={header}
              column={column}
              variant="inline"
              name="topicFilter"
              placeholder="Filter"
            />
          );
        },
        size: 120,
      },
      {
        accessorKey: "source_type.name",
        header: "Source",
        filterVariant: "multi-select",
        filterSelectOptions: complaintSourceList,
        Filter: ({ header, column }) => {
          return (
            <TableFilter
              isMulti
              header={header}
              column={column}
              variant="inline"
              name="sourceFilter"
              placeholder="Filter"
            />
          );
        },
        size: 120,
      },
      {
        accessorFn: (row) => row.primary_officer?.full_name,
        id: "primary_officer.full_name",
        header: "Primary",
        filterVariant: "multi-select",
        filterSelectOptions: staffUserList,
        Filter: ({ header, column }) => {
          return (
            <TableFilter
              isMulti
              header={header}
              column={column}
              variant="inline"
              name="primaryOfficerFilter"
              placeholder="Filter"
            />
          );
        },
        size: 120,
      },
    ],
    [complaintStatusList, staffUserList, topicList, complaintSourceList]
  );

  return (
    <MasterDataTable
      columns={columns}
      data={complaints ?? []}
      initialState={{
        sorting: [
          {
            id: "complaint_number",
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

export default CaseFileComplaintsTable;
