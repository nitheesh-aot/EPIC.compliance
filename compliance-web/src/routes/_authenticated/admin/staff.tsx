import { AddRounded } from "@mui/icons-material";
import { Box, Button, Stack, Typography } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { BCPalette } from "epic.theme";

export const Route = createFileRoute("/_authenticated/admin/staff")({
  component: Staff,
});

function Staff() {
  return (
    <>
      <Stack>
        <Box display={"flex"} justifyContent={"space-between"} alignItems={"center"}>
          <Typography variant="h5" sx={{ color: BCPalette.typography.link }}>
            Staff
          </Typography>
          <Button startIcon={<AddRounded />}>Staff Member</Button>
        </Box>
        {/* <Box sx={{ background: BCPalette.theme.gray[30], marginTop: "1.5rem" }}>Table</Box> */}
      </Stack>
    </>
  );
}
