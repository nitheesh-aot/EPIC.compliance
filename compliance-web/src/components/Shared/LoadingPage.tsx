import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

const loadingStyles = {
  container: {
    height: "80vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
};

type LoadingPageProps = {
  isLoading?: boolean;
};

const LoadingPage: React.FC<LoadingPageProps> = React.memo(({ isLoading = false }) => {
  if (!isLoading) return null;

  return (
    <Box sx={loadingStyles.container}>
      <CircularProgress size={84} aria-label="Loading spinner" />
      <Typography variant="h4">Loading</Typography>
    </Box>
  );
});

export default LoadingPage;
