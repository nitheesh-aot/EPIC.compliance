import React from "react";
import { WarningAmberRounded } from "@mui/icons-material";
import { Box, Button, Typography } from "@mui/material";
import { useRouter } from "@tanstack/react-router";
import { BCDesignTokens } from "epic.theme";

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    mx: 4,
    mb: 20,
  },
  icon: {
    color: BCDesignTokens.iconsColorWarning,
    fontSize: 100,
    mb: 2,
  },
  heading: {
    marginBottom: "0.5rem",
  },
  subheading: {
    fontWeight: 400,
    mb: 4,
    textAlign: "center" as const,
  },
};

const Unauthorized: React.FC = React.memo(() => {
  const { history } = useRouter();

  const handleGoBack = () => {
    history.back();
  };

  return (
    <Box sx={styles.container}>
      <WarningAmberRounded
        sx={styles.icon}
        aria-label="Unauthorized Warning Icon"
      />
      <Typography variant="h3" sx={styles.heading}>
        Unauthorized!
      </Typography>
      <Typography variant="h5" sx={styles.subheading}>
        Sorry, you are not authorized to access this.
      </Typography>
      <Button
        variant="contained"
        color="secondary"
        onClick={handleGoBack}
        aria-label="Go Back Button"
      >
        Go Back
      </Button>
    </Box>
  );
});

export default Unauthorized;
