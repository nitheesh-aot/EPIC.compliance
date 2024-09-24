import { createFileRoute } from "@tanstack/react-router";
import { AddRounded } from "@mui/icons-material";
import { Box, Typography, Button } from "@mui/material";
import { BCDesignTokens } from "epic.theme";
import { useDrawer } from "@/store/drawerStore";
import { notify } from "@/store/snackbarStore";
import ComplaintDrawer from "@/components/App/Complaints/ComplaintDrawer";

export const Route = createFileRoute("/_authenticated/ce-database/complaints")({
  component: Complaints,
});

export function Complaints() {
  const { setOpen, setClose } = useDrawer();

  const handleOnSubmit = (submitMsg: string) => {
    // queryClient.invalidateQueries({ queryKey: ["inspections"] });
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
        Complaints
      </Typography>
      <Button
        id="addActionButton"
        startIcon={<AddRounded />}
        onClick={handleOpenDrawer}
      >
        Complaint
      </Button>
    </Box>
  );
}
