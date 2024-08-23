import CaseFileDrawer from "@/components/App/CaseFiles/CaseFileDrawer";
import { useDrawer } from "@/store/drawerStore";
import { notify } from "@/store/snackbarStore";
import { AddRounded } from "@mui/icons-material";
import { Box, Button, Typography } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { BCDesignTokens } from "epic.theme";

export const Route = createFileRoute("/_authenticated/ce-database/case-files")({
  component: CaseFiles,
});

function CaseFiles() {
  const { setOpen, setClose } = useDrawer();

  const handleOpenModal = () => {
    setOpen(<CaseFileDrawer onSubmit={handleOnSubmit} />);
  };

  const handleOnSubmit = (submitMsg: string) => {
    setClose();
    notify.success(submitMsg);
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
        Case Files
      </Typography>
      <Button startIcon={<AddRounded />} onClick={() => handleOpenModal()}>
        Case File
      </Button>
    </Box>
  );
}
