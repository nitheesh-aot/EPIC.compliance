import { Box, CircularProgress, Typography } from "@mui/material";

const LoadingPage = ({ isLoading }: { isLoading: boolean }) => {
  return isLoading ? (
    <Box
      sx={{
        height: "80vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
      }}
    >
      <CircularProgress size={84} />
      <Typography variant="h4">Loading</Typography>
    </Box>
  ) : null;
};

export default LoadingPage;
