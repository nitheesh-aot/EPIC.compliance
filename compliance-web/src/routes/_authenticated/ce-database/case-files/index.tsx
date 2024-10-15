import CaseFileDrawer from "@/components/App/CaseFiles/CaseFileDrawer";
import TableFilter from "@/components/Shared/FilterSelect/TableFilter";
import MasterDataTable from "@/components/Shared/MasterDataTable/MasterDataTable";
import { searchFilter } from "@/components/Shared/MasterDataTable/utils";
import { useCaseFilesData } from "@/hooks/useCaseFiles";
import { CaseFile } from "@/models/CaseFile";
import { useDrawer } from "@/store/drawerStore";
import { notify } from "@/store/snackbarStore";
import dateUtils from "@/utils/dateUtils";
import { Chip, Link } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link as RouterLink } from "@tanstack/react-router";
import { MRT_ColumnDef } from "material-react-table";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/_authenticated/ce-database/case-files/")(
  {
    component: CaseFiles,
  }
);

export function CaseFiles() {
  const queryClient = useQueryClient();
  const { setOpen, setClose } = useDrawer();
  const { data: caseFilesList, isLoading } = useCaseFilesData();

  const [projectList, setProjectList] = useState<string[]>([]);
  const [initiationList, setInitiationList] = useState<string[]>([]);
  const [statusList, setStatusList] = useState<string[]>([]);
  const [staffUserList, setStaffUserList] = useState<string[]>([]);

  useEffect(() => {
    setProjectList(
      [...new Set(caseFilesList?.map((cf) => cf.project?.name ?? ""))].filter(
        Boolean
      )
    );
    setInitiationList(
      [
        ...new Set(caseFilesList?.map((cf) => cf.initiation?.name ?? "")),
      ].filter(Boolean)
    );
    setStatusList(
      [
        ...new Set(caseFilesList?.map((cf) => cf.case_file_status ?? "")),
      ].filter(Boolean)
    );
    setStaffUserList(
      [
        ...new Set(
          caseFilesList?.map((cf) => cf.lead_officer?.full_name ?? "")
        ),
      ].filter(Boolean)
    );
  }, [caseFilesList]);

  const handleOpenModal = () => {
    setOpen({
      content: <CaseFileDrawer onSubmit={handleOnSubmit} />,
      width: "718px",
    });
  };

  const handleOnSubmit = (submitMsg: string) => {
    queryClient.invalidateQueries({ queryKey: ["case-files"] });
    setClose();
    notify.success(submitMsg);
  };

  const columns = useMemo<MRT_ColumnDef<CaseFile>[]>(
    () => [
      {
        accessorKey: "case_file_number",
        header: "Case File #",
        sortingFn: "sortFn",
        filterFn: searchFilter,
        Cell: ({ row }) => {
          return (
            <Link
              component={RouterLink}
              to="/ce-database/case-files/$caseFileNumber"
              params={{
                caseFileNumber: row.original.case_file_number,
              }}
              underline="hover"
            >
              {row.original.case_file_number}
            </Link>
          );
        },
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
              placeholder="Filter Projects"
            />
          );
        },
      },
      {
        accessorKey: "initiation.name",
        header: "Initiation",
        filterVariant: "multi-select",
        filterSelectOptions: initiationList,
        Filter: ({ header, column }) => {
          return (
            <TableFilter
              isMulti
              header={header}
              column={column}
              variant="inline"
              name="initiationFilter"
              placeholder="Filter Initiations"
            />
          );
        },
      },
      {
        accessorFn: (row) => dateUtils.formatDate(row.date_created),
        id: "date_created",
        header: "Date Created",
      },
      {
        accessorKey: "case_file_status",
        header: "Status",
        Cell: ({ row }) => {
          return row.original.case_file_status ? (
            <Chip
              label={row.original.case_file_status}
              color={
                row.original.case_file_status?.toLowerCase() === "open"
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
              name="statusFilter"
              placeholder="Filter Status"
            />
          );
        },
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
              placeholder="Filter Lead Officers"
            />
          );
        },
      },
    ],
    [initiationList, projectList, staffUserList, statusList]
  );

  return (
    <>
      <MasterDataTable
        columns={columns}
        data={caseFilesList ?? []}
        initialState={{
          sorting: [
            {
              id: "case_file_number",
              desc: false,
            },
          ],
        }}
        state={{
          isLoading: isLoading,
          showGlobalFilter: true,
        }}
        titleToolbarProps={{
          tableTitle: "Case Files",
          tableAddRecordButtonText: "Case File",
          tableAddRecordFunction: () => handleOpenModal(),
        }}
      />
    </>
  );
}
