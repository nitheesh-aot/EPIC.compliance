import { ErrorTwoTone } from "@mui/icons-material";
import { Box, Typography, Button } from "@mui/material";
import { useRouter } from "@tanstack/react-router";

const ErrorPage = ({ error }: { error: Error }) => {
  const { history } = useRouter();

  return (
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
      <ErrorTwoTone sx={{ fontSize: 64 }} color="error" />
      <Typography variant="h4">{error.message}</Typography>
      <Button
        variant="contained"
        color="secondary"
        onClick={() => history.back()}
      >
        Go Back
      </Button>
    </Box>
  );
};

export default ErrorPage;
