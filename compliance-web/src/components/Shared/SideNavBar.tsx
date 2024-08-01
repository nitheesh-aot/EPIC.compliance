import {
  Box,
  List,
  ListItem,
  Typography,
  Button,
} from "@mui/material";
import { Link } from "@tanstack/react-router";
import { theme } from "@/styles/theme";
import { useAuth } from "react-oidc-context";
import {
  Assessment,
  ChevronLeft,
  SaveOutlined,
  Settings,
} from "@mui/icons-material";

export default function SideNavBar() {
  const { isAuthenticated } = useAuth();

  let routeMenuItems = [
    {
      routeName: "Root",
      path: "/",
    },
    {
      routeName: "About",
      path: "/about",
      icon: <Assessment sx={{ transform: "rotate(180deg)" }} />,
    },
    {
      routeName: "Lazy Loaded Page",
      path: "/newpage",
      icon: <Settings />,
    },
    {
      routeName: "Plans",
      path: "/eao-plans",
      icon: <SaveOutlined />,
    },
    {
      routeName: "Users",
      path: "/users",
    },
  ];

  const authenticatedRouteMenuItems = [
    {
      routeName: "Profile",
      path: "/profile",
    },
  ];

  if (isAuthenticated) {
    routeMenuItems = routeMenuItems.concat(authenticatedRouteMenuItems);
  }

  return (
    <Box display={"flex"} alignItems={"flex-start"}>
      <Box
        bgcolor={theme.palette.primary.main}
        width={260}
        height={"100%"}
        display={"flex"}
        flexDirection={"column"}
        justifyContent={"space-between"}
      >
        <List>
          {routeMenuItems.map((route) => (
            <ListItem key={route.routeName} disablePadding>
              <Link
                to={route.path}
                activeProps={{
                  style: {
                    color: theme.palette.secondary.main,
                    fontWeight: 700,
                    width: "100%",
                  },
                }}
                style={{
                  color: theme.palette.common.white,
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "1rem 1.5rem",
                }}
              >
                {route.icon ?? route.icon}
                {route.routeName}
              </Link>
            </ListItem>
          ))}
        </List>
        <Typography
          variant="body1"
          color={theme.palette.common.white}
          textAlign={"center"}
          paddingBottom={"3rem"}
        >
          Version: 1.0.1
        </Typography>
      </Box>
      <Button
        sx={{
          height: "3rem",
          width: "2rem",
          padding: "0.75rem 0.5rem",
          minWidth: "auto",
          marginLeft: "2px",
          marginRight: "14px",
          borderRadius: "0px 0.25rem 0.25rem 0"
        }}
        color="primary"
      >
        <ChevronLeft fontSize={"large"} />
      </Button>
    </Box>
  );
}
