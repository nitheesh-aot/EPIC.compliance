import { WarningAmberRounded } from "@mui/icons-material";
import { Box, Button, Typography } from "@mui/material";
import { useRouter } from "@tanstack/react-router";
import { BCDesignTokens } from "epic.theme";

export default function Unauthorized() {
  const { history } = useRouter();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        mx: 4,
        mb: 20,
      }}
    >
      <WarningAmberRounded
        sx={{ color: BCDesignTokens.iconsColorWarning, fontSize: 100, mb: 2 }}
      />
      <Typography variant="h3" marginBottom={"0.5rem"}>
        Unauthorized!
      </Typography>
      <Typography variant="h5" fontWeight="400" mb={4} textAlign={"center"}>
        Sorry, you are not authorized to access this.
      </Typography>
      <Button
        variant="contained"
        color="secondary"
        onClick={() => history.back()}
      >
        Go Back
      </Button>
    </Box>
  );
}
