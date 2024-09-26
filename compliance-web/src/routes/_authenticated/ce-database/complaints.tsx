import { createFileRoute } from "@tanstack/react-router";
import { Chip } from "@mui/material";
import { useDrawer } from "@/store/drawerStore";
import { notify } from "@/store/snackbarStore";
import ComplaintDrawer from "@/components/App/Complaints/ComplaintDrawer";
import { useQueryClient } from "@tanstack/react-query";
import { useComplaintsData } from "@/hooks/useComplaints";
import { useEffect, useMemo, useState } from "react";
import { Complaint } from "@/models/Complaint";
import { searchFilter } from "@/components/Shared/MasterDataTable/utils";
import { MRT_ColumnDef } from "material-react-table";
import TableFilter from "@/components/Shared/FilterSelect/TableFilter";
import dateUtils from "@/utils/dateUtils";
import MasterDataTable from "@/components/Shared/MasterDataTable/MasterDataTable";

export const Route = createFileRoute("/_authenticated/ce-database/complaints")({
  component: Complaints,
});

export function Complaints() {
  const queryClient = useQueryClient();
  const { setOpen, setClose } = useDrawer();
  const { data: complaintsList, isLoading } = useComplaintsData();

  const [projectList, setProjectList] = useState<string[]>([]);
  const [topicList, setTopicList] = useState<string[]>([]);
  const [complaintSourceList, setComplaintSourceList] = useState<string[]>([]);
  const [officerList, setOfficerList] = useState<string[]>([]);
  const [statusList, setStatusList] = useState<string[]>([]);

  useEffect(() => {
    setProjectList(
      [
        ...new Set(complaintsList?.map((comp) => comp.project?.name ?? "")),
      ].filter(Boolean)
    );
    setTopicList(
      [
        ...new Set(
          complaintsList?.map(
            (comp) => comp.requirement_detail?.topic?.name ?? ""
          )
        ),
      ].filter(Boolean)
    );
    setComplaintSourceList(
      [
        ...new Set(complaintsList?.map((comp) => comp.source_type?.name ?? "")),
      ].filter(Boolean)
    );
    setOfficerList(
      [
        ...new Set(
          complaintsList?.map((comp) => comp.lead_officer?.full_name ?? "")
        ),
      ].filter(Boolean)
    );
    setStatusList(
      [...new Set(complaintsList?.map((comp) => comp.status ?? ""))].filter(
        Boolean
      )
    );
  }, [complaintsList]);

  const columns = useMemo<MRT_ColumnDef<Complaint>[]>(
    () => [
      {
        accessorKey: "complaint_number",
        header: "Complaint #",
        sortingFn: "sortFn",
        filterFn: searchFilter,
      },
      {
        accessorKey: "project.name",
        header: "Project",
        filterVariant: "multi-select",
        filterSelectOptions: projectList,
        Filter: ({ header, column }) => {
          return (
            <TableFilter
              isMulti
              header={header}
              column={column}
              variant="inline"
              name="projectFilter"
              placeholder="Filter"
            />
          );
        },
      },
      {
        accessorKey: "requirement_detail?.topic?.name",
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
        size: 150,
      },
      {
        accessorFn: (row) => dateUtils.formatDate(row.date_received),
        id: "date_received",
        header: "Date Received",
        size: 120,
      },
      {
        accessorKey: "source_type.name",
        header: "Complaint Source",
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
        size: 150,
      },
      {
        accessorKey: "lead_officer.full_name",
        header: "Lead Officer",
        filterVariant: "multi-select",
        filterSelectOptions: officerList,
        Filter: ({ header, column }) => {
          return (
            <TableFilter
              isMulti
              header={header}
              column={column}
              variant="inline"
              name="officerFilter"
              placeholder="Filter"
            />
          );
        },
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
        filterSelectOptions: statusList,
        Filter: ({ header, column }) => {
          return (
            <TableFilter
              isMulti
              header={header}
              column={column}
              variant="inline"
              name="complaintStatusFilter"
              placeholder="Filter"
            />
          );
        },
        size: 150,
      },
      {
        accessorKey: "case_file.case_file_number",
        header: "Case File #",
        filterFn: searchFilter,
      },
    ],
    [projectList, topicList, complaintSourceList, officerList, statusList]
  );

  const handleOnSubmit = (submitMsg: string) => {
    queryClient.invalidateQueries({ queryKey: ["complaints"] });
    setClose();
    notify.success(submitMsg);
  };

  const handleOpenDrawer = () => {
    setOpen({
      content: <ComplaintDrawer onSubmit={handleOnSubmit} />,
      width: "1118px",
    });
  };

  return (
    <MasterDataTable
      columns={columns}
      data={complaintsList ?? []}
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
      titleToolbarProps={{
        tableTitle: "Complaints",
        tableAddRecordButtonText: "Complaint",
        tableAddRecordFunction: () => handleOpenDrawer(),
      }}
    />
  );
}
