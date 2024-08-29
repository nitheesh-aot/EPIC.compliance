import CaseFileDrawer from "@/components/App/CaseFiles/CaseFileDrawer";
import TableFilter from "@/components/Shared/FilterSelect/TableFilter";
import MasterDataTable from "@/components/Shared/MasterDataTable/MasterDataTable";
import { searchFilter } from "@/components/Shared/MasterDataTable/utils";
import { useCaseFilesData } from "@/hooks/useCaseFiles";
import { CaseFile } from "@/models/CaseFile";
import { StaffUser } from "@/models/Staff";
import { useDrawer } from "@/store/drawerStore";
import { notify } from "@/store/snackbarStore";
import dateUtils from "@/utils/dateUtils";
import { DeleteOutlineRounded, EditOutlined } from "@mui/icons-material";
import { Box, Chip, IconButton } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { MRT_ColumnDef } from "material-react-table";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/_authenticated/ce-database/case-files")({
  component: CaseFiles,
});

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
        ...new Set(
          caseFilesList?.map((cf) => (cf.is_active ? "Active" : "Inactive"))
        ),
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
      modal: <CaseFileDrawer onSubmit={handleOnSubmit} />,
      width: "718px",
    });
  };

  const handleOnSubmit = (submitMsg: string) => {
    queryClient.invalidateQueries({ queryKey: ["case-files"] });
    setClose();
    notify.success(submitMsg);
  };

  const handleEdit = (staff: StaffUser) => {
    //TODO: EDIT
    // eslint-disable-next-line no-console
    console.log(staff);
  };

  const handleDelete = (id: number) => {
    //TODO: DELETE
    // eslint-disable-next-line no-console
    console.log(id);
  };

  const columns = useMemo<MRT_ColumnDef<CaseFile>[]>(
    () => [
      {
        accessorKey: "case_file_number",
        header: "Case File #",
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
        accessorKey: "is_active",
        header: "Status",
        Cell: ({ row }) => {
          return row.original.is_active ? (
            <Chip
              label="Active"
              color="success"
              variant="outlined"
              size="small"
            />
          ) : (
            <Chip
              label="Inactive"
              color="error"
              variant="outlined"
              size="small"
            />
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
        filterFn: (row, id, filterValue) => {
          if (
            !filterValue.length ||
            filterValue.length > statusList.length // select all is selected
          ) {
            return true;
          }
          return filterValue.includes(
            row.getValue(id) || false ? "Active" : "Inactive"
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
        enableRowActions={true}
        renderRowActions={({ row }) => (
          <Box gap={".25rem"} display={"flex"}>
            <IconButton
              aria-label="edit"
              onClick={() => handleEdit(row.original)}
            >
              <EditOutlined />
            </IconButton>
            <IconButton
              aria-label="delete"
              onClick={() => handleDelete(row.original.id)}
            >
              <DeleteOutlineRounded />
            </IconButton>
          </Box>
        )}
        titleToolbarProps={{
          tableTitle: "Case Files",
          tableAddRecordButtonText: "Case File",
          tableAddRecordFunction: () => handleOpenModal(),
        }}
      />
    </>
  );
}
