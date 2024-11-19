import React from "react";
import { ErrorTwoTone } from "@mui/icons-material";
import { Box, Typography, Button } from "@mui/material";
import { useRouter } from "@tanstack/react-router";

const styles = {
  container: {
    height: "80vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  icon: {
    fontSize: 64,
  },
};

type ErrorPageProps = {
  error: Error;
  hideBackButton?: boolean;
};

const ErrorPage: React.FC<ErrorPageProps> = React.memo(
  ({ error, hideBackButton = false }) => {
    const { history } = useRouter();

    const handleGoBack = () => {
      history.back();
    };

    return (
      <Box sx={styles.container}>
        <ErrorTwoTone sx={styles.icon} color="error" />
        <Typography variant="h4">{error.message}</Typography>
        {!hideBackButton && (
          <Button variant="contained" color="secondary" onClick={handleGoBack}>
            Go Back
          </Button>
        )}
      </Box>
    );
  }
);

export default ErrorPage;
