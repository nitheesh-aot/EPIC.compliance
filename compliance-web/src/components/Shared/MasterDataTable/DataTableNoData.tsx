import { SearchRounded } from "@mui/icons-material";
import { Container, Box, Typography } from "@mui/material";

const DataTableNoData = ({ ...props }) => {
  const { table } = props;
  return (
    <Container
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "400px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "2rem",
          alignItems: "center",
        }}
      >
        <SearchRounded sx={{ fontSize: "2rem" }} />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            alignItems: "center",
          }}
        >
          <Typography variant="h2" color="initial">
            No results found
          </Typography>
          {table.options.data.length > 0 && (
            <Typography variant="h4">
              Adjust your parameters and try again
            </Typography>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default DataTableNoData;
