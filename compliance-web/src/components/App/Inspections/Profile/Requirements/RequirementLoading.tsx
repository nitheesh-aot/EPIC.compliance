import { Box, Grid, Skeleton } from "@mui/material";
import { requirementCardStyles } from "./RequirementUtils";

const RequirementLoading: React.FC = () => {
  return (
    <Box
      display={"flex"}
      flexDirection={"column"}
      gap={0.5}
      justifyContent={"center"}
      mt={3}
    >
      {[...Array(3)].map((_, index) => (
        <Box
          key={index}
          sx={{
            ...requirementCardStyles.card,
            width: "calc(100% - 2px)",
          }}
        >
          <Box
            sx={{
              ...requirementCardStyles.header,
              pl: 3,
            }}
          >
            <Skeleton variant="rounded" width={24} height={24} sx={{ mr: 1 }} />
            <Skeleton variant="rounded" width={"100%"} height={24} />
          </Box>
          <Box sx={requirementCardStyles.content}>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <Skeleton
                  variant="rounded"
                  width={"25%"}
                  height={20}
                  sx={{ mb: 0.25 }}
                />
                <Skeleton variant="rounded" width={"100%"} height={40} />
              </Grid>
              <Grid item xs={4}>
                <Skeleton
                  variant="rounded"
                  width={"50%"}
                  height={20}
                  sx={{ mb: 0.25 }}
                />
                <Skeleton variant="rounded" width={"100%"} height={48} />
              </Grid>
              <Grid item xs={8}>
                <Skeleton
                  variant="rounded"
                  width={"25%"}
                  height={20}
                  sx={{ mb: 0.25 }}
                />
                <Skeleton variant="rounded" width={"100%"} height={48} />
              </Grid>
            </Grid>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default RequirementLoading;
