import { AppConfig } from "@/utils/config";
import { ErrorOutline } from "@mui/icons-material";
import { Box, Typography, useTheme } from "@mui/material";


export default function EnvironmentBanner() {
  const env = AppConfig.environment;
  const isTestEnvironment = ["dev", "test", "demo", "local"].includes(env);
  const theme = useTheme();

  if (!isTestEnvironment) {
    return (
      <Box
        height={8}
        bgcolor={{backgroundColor: theme.palette.secondary.main}}
      ></Box>
    );
  }
  
  return (
    <Box
      sx={{
        backgroundColor: theme.palette.secondary.main,
        color: theme.palette.text.secondary,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "8px",
        height: 40,
      }}
      textAlign="center"
    >
      <ErrorOutline />
      <Typography variant="h6" fontWeight={400}>You are using a {env.toUpperCase()} environment</Typography>
    </Box>
  );
}
