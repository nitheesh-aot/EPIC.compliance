import StaffModal from "@/components/App/Staff/StaffModal";
import { useModal } from "@/store/modalStore";
import { notify } from "@/store/snackbarStore";
import {
  AddRounded,
  DeleteOutlineRounded,
  EditOutlined,
} from "@mui/icons-material";
import { Box, Button, IconButton, Typography } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { BCDesignTokens } from "epic.theme";
import { StaffUser } from "@/models/Staff";
import { useDeleteStaff, useStaffUsersData } from "@/hooks/useStaff";
import { MRT_ColumnDef } from "material-react-table";
import { useEffect, useMemo, useState } from "react";
import MasterDataTable from "@/components/Shared/MasterDataTable/MasterDataTable";
import { searchFilter } from "@/components/Shared/MasterDataTable/utils";
import TableFilter from "@/components/Shared/FilterSelect/TableFilter";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import ConfirmationModal from "@/components/Shared/Popups/ConfirmationModal";

export const Route = createFileRoute("/_authenticated/admin/staff")({
  component: Staff,
});

function Staff() {
  const queryClient = useQueryClient();
  const { setOpen, setClose } = useModal();
  const { data: staffUsersList, isLoading } = useStaffUsersData();

  const [positionList, setPositionList] = useState<string[]>([]);
  const [supervisorList, setSupervisorList] = useState<string[]>([]);
  const [deputyList, setDeputyList] = useState<string[]>([]);
  const [permissionList, setPermissionList] = useState<string[]>([]);

  useEffect(() => {
    setPositionList(
      [
        ...new Set(staffUsersList?.map((staff) => staff.position?.name ?? "")),
      ].filter(Boolean)
    );
    setSupervisorList(
      [
        ...new Set(
          staffUsersList?.map((staff) => staff.supervisor?.full_name ?? "")
        ),
      ].filter(Boolean)
    );
    setDeputyList(
      [
        ...new Set(
          staffUsersList?.map((staff) => staff.deputy_director?.full_name ?? "")
        ),
      ].filter(Boolean)
    );
    setPermissionList(
      [
        ...new Set(staffUsersList?.map((staff) => staff.permission ?? "")),
      ].filter(Boolean)
    );
  }, [staffUsersList]);

  const handleOnSubmit = (submitMsg: string) => {
    queryClient.invalidateQueries({ queryKey: ["staff-users"] });
    setClose();
    notify.success(submitMsg);
  };

  const handleAddStaffModal = () => {
    setOpen(<StaffModal onSubmit={handleOnSubmit} />);
  };
  
  const handleEdit = (staff: StaffUser) => {
    setOpen(<StaffModal staff={staff} onSubmit={handleOnSubmit} />);
  };

  /** Agency Deletion START */

  const onDeleteSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["staff-users"] });
    setClose();
    notify.success("Staff deleted successfully!");
  };

  const onDeleteError = (error: AxiosError) => {
    notify.error(`Staff deletion failed! ${error.message}`);
  };

  const { mutate: deleteUser } = useDeleteStaff(
    onDeleteSuccess,
    onDeleteError
  );

  const handleDelete = (id: number) => {
    setOpen(
      <ConfirmationModal
        title="Delete Staff User?"
        description="You are about to delete this staff user. Are you sure?"
        confirmButtonText="Delete"
        onConfirm={() => {
          if (id !== null) {
            deleteUser(id);
          }
        }}
      />
    );
  };

  /** Agency Deletion END */

  const columns = useMemo<MRT_ColumnDef<StaffUser>[]>(
    () => [
      {
        accessorKey: "full_name",
        header: "Name",
        sortingFn: "sortFn",
        filterFn: searchFilter,
      },
      {
        accessorKey: "position.name",
        header: "Position",
        filterVariant: "multi-select",
        filterSelectOptions: positionList,
        Filter: ({ header, column }) => {
          return (
            <TableFilter
              isMulti
              header={header}
              column={column}
              variant="inline"
              name="positionFilter"
              placeholder="Filter Positions"
            />
          );
        },
      },
      {
        accessorFn: (row) => row.supervisor?.full_name,
        id: "supervisor.full_name",
        header: "Supervisor",
        filterVariant: "multi-select",
        filterSelectOptions: supervisorList,
        Filter: ({ header, column }) => {
          return (
            <TableFilter
              isMulti
              header={header}
              column={column}
              variant="inline"
              name="supervisorFilter"
              placeholder="Filter Supervisors"
            />
          );
        },
      },
      {
        accessorFn: (row) => row.deputy_director?.full_name,
        id: "deputy_director.full_name",
        header: "Deputy Director",
        filterVariant: "multi-select",
        filterSelectOptions: deputyList,
        Filter: ({ header, column }) => {
          return (
            <TableFilter
              isMulti
              header={header}
              column={column}
              variant="inline"
              name="deputyFilter"
              placeholder="Filter Deputy Directors"
            />
          );
        },
      },
      {
        accessorKey: "permission",
        header: "Permission Level",
        filterVariant: "multi-select",
        filterSelectOptions: permissionList,
        Filter: ({ header, column }) => {
          return (
            <TableFilter
              isMulti
              header={header}
              column={column}
              variant="inline"
              name="permissionFilter"
              placeholder="Filter Permissions"
            />
          );
        },
      },
    ],
    [deputyList, permissionList, positionList, supervisorList]
  );

  return (
    <>
      <MasterDataTable
        columns={columns}
        data={staffUsersList ?? []}
        initialState={{
          sorting: [
            {
              id: "full_name",
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
        renderTopToolbarCustomActions={() => (
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography
              variant="h5"
              sx={{ color: BCDesignTokens.typographyColorLink }}
            >
              Staff
            </Typography>
            <Button
              startIcon={<AddRounded />}
              onClick={() => handleAddStaffModal()}
            >
              Staff Member
            </Button>
          </Box>
        )}
      />
    </>
  );
}
