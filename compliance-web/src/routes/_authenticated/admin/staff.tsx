import StaffModal from "@/components/App/Staff/StaffModal";
import { useModal } from "@/store/modalStore";
import { notify } from "@/store/snackbarStore";
import { AddRounded } from "@mui/icons-material";
import { Box, Button, Stack, Typography } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { BCPalette } from "epic.theme";
import { Staff as StaffModel } from "@/models/Staff";

export const Route = createFileRoute("/_authenticated/admin/staff")({
  component: Staff,
});

function Staff() {
  const { setOpen } = useModal();

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

  return (
    <>
      <Stack>
        <Box
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"center"}
        >
          <Typography variant="h5" sx={{ color: BCPalette.typography.link }}>
            Staff
          </Typography>
          <Button
            startIcon={<AddRounded />}
            onClick={() => handleOpenModal()}
          >
            Staff Member
          </Button>
        </Box>
        {/* <Box sx={{ background: BCPalette.theme.gray[30], marginTop: "1.5rem" }}>Table</Box> */}
      </Stack>
    </>
  );
}
