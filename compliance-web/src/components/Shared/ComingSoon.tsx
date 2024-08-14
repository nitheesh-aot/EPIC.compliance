import { DesignServices } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";
import { BCDesignTokens } from "epic.theme";

export default function ComingSoon() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        marginBottom: 16,
      }}
    >
      <Box
        sx={{
          padding: "1rem",
          background: BCDesignTokens.surfaceColorBackgroundLightGray,
          marginBottom: "2.5rem",
        }}
      >
        <DesignServices
          fontSize="large"
          sx={{ color: BCDesignTokens.surfaceColorBorderActive }}
        />
      </Box>
      <Typography variant="h3" marginBottom={"0.5rem"}>
        Coming soon!
      </Typography>
      <Typography variant="h5" fontWeight="400">
        Our team is developing this feature and plans to launch it soon
      </Typography>
    </Box>
  );
}
