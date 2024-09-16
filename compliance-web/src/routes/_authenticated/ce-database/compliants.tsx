import { createFileRoute } from "@tanstack/react-router";
import { AddRounded } from "@mui/icons-material";
import { Box, Typography, Button } from "@mui/material";
import { BCDesignTokens } from "epic.theme";

export const Route = createFileRoute("/_authenticated/ce-database/compliants")({
  component: Compliance,
});

function Compliance() {
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
        // onClick={}
      >
        Complaint
      </Button>
    </Box>
  );
}
