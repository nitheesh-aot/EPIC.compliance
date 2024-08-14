import StaffModal from "@/components/App/Staff/StaffModal";
import { useModal } from "@/store/modalStore";
import { notify } from "@/store/snackbarStore";
import { AddRounded } from "@mui/icons-material";
import { Box, Button, Stack, Typography } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { BCDesignTokens } from "epic.theme";
import { Staff as StaffModel, StaffUser } from "@/models/Staff";
import { useStaffUsersData } from "@/hooks/useStaff";
import { MRT_ColumnDef } from "material-react-table";
import { useMemo } from "react";
import MasterDataTable from "@/components/Shared/MasterDataTable/MasterDataTable";

export const Route = createFileRoute("/_authenticated/admin/staff")({
  component: Staff,
});

function Staff() {
  const { setOpen } = useModal();

  const { data: staffUsersList, isLoading } = useStaffUsersData();

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

  // const mockStaff: StaffModel = {
  //   id: 1,
  //   name: 1,
  //   position: "2",
  //   deputyDirector: 2,
  //   supervisor: 3,
  //   permission: "VIEWER",
  // };

  const columns = useMemo<MRT_ColumnDef<StaffUser>[]>(
    () => [
      {
        accessorKey: "full_name",
        header: "Name",
      },
      {
        accessorKey: "position.name",
        header: "Position",
      },
      {
        accessorKey: "supervisor.full_name",
        header: "Supervisor",
      },
      {
        accessorKey: "deputy_director.full_name",
        header: "Deputy Director",
      },
      {
        accessorKey: "auth_user_guid",
        header: "Permission Level",
      },
    ],
    []
  );

  return (
    <>
      <Stack>
        <Box
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"center"}
        >
          <Typography
            variant="h5"
            sx={{ color: BCDesignTokens.typographyColorLink }}
          >
            Staff
          </Typography>
          <Button startIcon={<AddRounded />} onClick={() => handleOpenModal()}>
            Staff Member
          </Button>
        </Box>
        <Box
          sx={{ background: BCDesignTokens.themeGray30, marginTop: "1.5rem" }}
        >
          <MasterDataTable
            columns={columns}
            data={staffUsersList ?? []}
            initialState={{
              sorting: [
                {
                  id: "name",
                  desc: false,
                },
              ],
            }}
            state={{
              isLoading: isLoading,
              showGlobalFilter: true,
            }}
            enableRowActions={true}
            // renderTopToolbarCustomActions={() => (
            //   <Box
            //     sx={{
            //       width: "100%",
            //       display: "flex",
            //       justifyContent: "right",
            //     }}
            //   >
            //     <Restricted
            //       allowed={[ROLES.CREATE]}
            //       errorProps={{ disabled: true }}
            //     >
            //       <Button
            //         onClick={() => {
            //           setShowCreateDialog(true);
            //           setTemplateId(undefined);
            //         }}
            //         variant="contained"
            //       >
            //         Create Task Template
            //       </Button>
            //     </Restricted>
            //   </Box>
            // )}
          />
        </Box>
      </Stack>
    </>
  );
}
