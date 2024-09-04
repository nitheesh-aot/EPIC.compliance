import InspectionDrawer from "@/components/App/Inspections/InspectionDrawer";
import { useDrawer } from "@/store/drawerStore";
import { notify } from "@/store/snackbarStore";
import { Box, Button } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/ce-database/inspections")(
  {
    component: Inspection,
  }
);

function Inspection() {
  const { setOpen, setClose } = useDrawer();

  const handleOnSubmit = (submitMsg: string) => {
    // queryClient.invalidateQueries({ queryKey: ["case-files"] });
    setClose();
    notify.success(submitMsg);
  };

  const handleOpenModal = () => {
    setOpen({
      modal: <InspectionDrawer onSubmit={handleOnSubmit} />,
      width: "1118px",
    });
  };

  return (
    <Box>
      <Button onClick={handleOpenModal}>Inspection</Button>
    </Box>
  );
}
