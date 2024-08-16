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
import { Staff as StaffModel, StaffUser } from "@/models/Staff";
import { useStaffUsersData } from "@/hooks/useStaff";
import { MRT_ColumnDef } from "material-react-table";
import { useEffect, useMemo, useState } from "react";
import MasterDataTable from "@/components/Shared/MasterDataTable/MasterDataTable";
import { searchFilter } from "@/components/Shared/MasterDataTable/utils";
import TableFilter from "@/components/Shared/FilterSelect/TableFilter";

export const Route = createFileRoute("/_authenticated/admin/staff")({
  component: Staff,
});

function Staff() {
  const { setOpen } = useModal();
  const { data: staffUsersList, isLoading } = useStaffUsersData();

  const [positionList, setPositionList] = useState<string[]>([]);
  const [supervisorList, setSupervisorList] = useState<string[]>([]);
  const [deputyList, setDeputyList] = useState<string[]>([]);

  useEffect(() => {
    const positions = [
      ...new Set(staffUsersList?.map((staff) => staff.position?.name ?? "")),
    ].filter(Boolean);
    setPositionList(positions);
    const supervisors = [
      ...new Set(
        staffUsersList?.map((staff) => staff.supervisor?.full_name ?? "")
      ),
    ].filter(Boolean);
    setSupervisorList(supervisors);
    const deputies = [
      ...new Set(
        staffUsersList?.map((staff) => staff.deputy_director?.full_name ?? "")
      ),
    ].filter(Boolean);
    setDeputyList(deputies);
  }, [staffUsersList]);

  const handleOnSubmit = () => {
    // if (selectedUser) {
    //   notify.success("User updated successfully!");
    // } else {
    //   notify.success("User created successfully!");
    // }
    notify.success("Submit button click!");
  };

  const handleOpenModal = (staff?: StaffModel) => {
    setOpen(<StaffModal staff={staff} onSubmit={handleOnSubmit} />);
  };

  const handleDelete = (id: number) => {
    // TODO: DELETE
    // eslint-disable-next-line no-console
    console.log(id);
  };

  const handleEdit = (id: number) => {
    // TODO: EDIT
    // eslint-disable-next-line no-console
    console.log(id);
  };

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
        accessorKey: "auth_user_guid",
        header: "Permission Level",
      },
    ],
    [deputyList, positionList, supervisorList]
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
              onClick={() => handleEdit(row.original.id)}
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
              onClick={() => handleOpenModal()}
            >
              Staff Member
            </Button>
          </Box>
        )}
      />
    </>
  );
}
