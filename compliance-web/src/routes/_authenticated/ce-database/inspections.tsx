import InspectionDrawer from "@/components/App/Inspections/InspectionDrawer";
import MasterDataTable from "@/components/Shared/MasterDataTable/MasterDataTable";
import { searchFilter } from "@/components/Shared/MasterDataTable/utils";
import { useInspectionsData } from "@/hooks/useInspections";
import { Inspection } from "@/models/Inspection";
import { useDrawer } from "@/store/drawerStore";
import { notify } from "@/store/snackbarStore";
import { EditOutlined, DeleteOutlineRounded } from "@mui/icons-material";
import { Box, Chip, IconButton } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { MRT_ColumnDef } from "material-react-table";
import { useMemo } from "react";

export const Route = createFileRoute("/_authenticated/ce-database/inspections")(
  { component: Inspections }
);

function Inspections() {
  const queryClient = useQueryClient();
  const { setOpen, setClose } = useDrawer();
  const { data: inspectionsList, isLoading } = useInspectionsData();

  const columns = useMemo<MRT_ColumnDef<Inspection>[]>(
    () => [
      {
        accessorKey: "ir_number",
        header: "IR #",
        sortingFn: "sortFn",
        filterFn: searchFilter,
      },
      {
        accessorKey: "project.name",
        header: "Project",
        // filterVariant: "multi-select",
        // filterSelectOptions: projectList,
        // Filter: ({ header, column }) => {
        //   return (
        //     <TableFilter
        //       isMulti
        //       header={header}
        //       column={column}
        //       variant="inline"
        //       name="projectFilter"
        //       placeholder="Filter Projects"
        //     />
        //   );
        // },
      },
      {
        accessorKey: "ir_status.name",
        header: "Stage",
        // filterVariant: "multi-select",
        // filterSelectOptions: initiationList,
        // Filter: ({ header, column }) => {
        //   return (
        //     <TableFilter
        //       isMulti
        //       header={header}
        //       column={column}
        //       variant="inline"
        //       name="initiationFilter"
        //       placeholder="Filter Initiations"
        //     />
        //   );
        // },
      },
      {
        accessorKey: "initiation.name",
        header: "Initiation",
        // filterVariant: "multi-select",
        // filterSelectOptions: initiationList,
        // Filter: ({ header, column }) => {
        //   return (
        //     <TableFilter
        //       isMulti
        //       header={header}
        //       column={column}
        //       variant="inline"
        //       name="initiationFilter"
        //       placeholder="Filter Initiations"
        //     />
        //   );
        // },
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
        // filterVariant: "multi-select",
        // filterSelectOptions: statusList,
        // Filter: ({ header, column }) => {
        //   return (
        //     <TableFilter
        //       isMulti
        //       header={header}
        //       column={column}
        //       variant="inline"
        //       name="statusFilter"
        //       placeholder="Filter Status"
        //     />
        //   );
        // },
        // filterFn: (row, id, filterValue) => {
        //   if (
        //     !filterValue.length ||
        //     filterValue.length > statusList.length // select all is selected
        //   ) {
        //     return true;
        //   }
        //   return filterValue.includes(
        //     row.getValue(id) || false ? "Active" : "Inactive"
        //   );
        // },
      },
      {
        accessorFn: (row) => row.lead_officer?.full_name,
        id: "lead_officer.full_name",
        header: "Lead Officer",
        // filterVariant: "multi-select",
        // filterSelectOptions: staffUserList,
        // Filter: ({ header, column }) => {
        //   return (
        //     <TableFilter
        //       isMulti
        //       header={header}
        //       column={column}
        //       variant="inline"
        //       name="leadOfficersFilter"
        //       placeholder="Filter Lead Officers"
        //     />
        //   );
        // },
      },
    ],
    []
  );

  const handleOnSubmit = (submitMsg: string) => {
    queryClient.invalidateQueries({ queryKey: ["inspections"] });
    setClose();
    notify.success(submitMsg);
  };

  const handleOpenModal = () => {
    setOpen({
      modal: <InspectionDrawer onSubmit={handleOnSubmit} />,
      width: "1118px",
    });
  };

  const handleEdit = (inspection: Inspection) => {
    //TODO: EDIT
    // eslint-disable-next-line no-console
    console.log(inspection);
  };

  const handleDelete = (id: number) => {
    //TODO: DELETE
    // eslint-disable-next-line no-console
    console.log(id);
  };

  return (
    <MasterDataTable
      columns={columns}
      data={inspectionsList ?? []}
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
        tableTitle: "Inspections",
        tableAddRecordButtonText: "Inspection",
        tableAddRecordFunction: () => handleOpenModal(),
      }}
    />
  );
}
