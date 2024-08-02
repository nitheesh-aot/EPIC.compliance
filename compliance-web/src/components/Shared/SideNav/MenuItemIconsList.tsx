import { theme } from "@/styles/theme";
import { ListItem, Box, List } from "@mui/material";
import { Fragment } from "react/jsx-runtime";
import RouteItemsList, { RouteMenuItem } from "./RouteItemsList";
import { useMenuStore } from "@/store/menuStore";

export default function MenuItemIconsList() {
  const routeMenuItems: RouteMenuItem[] = RouteItemsList();

  const { toggleMenu } = useMenuStore();

  const renderMenuIcons = () => {
    return routeMenuItems.map((route) => {
      return (
        <Fragment key={route.routeName}>
          <ListItem
            key={route.routeName}
            onClick={() => toggleMenu(route.routeName)}
            disablePadding
            sx={{ cursor: "pointer" }}
          >
            <Box
              sx={{
                color: theme.palette.common.white,
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "1rem",
              }}
            >
              {route.icon ?? route.icon}
            </Box>
          </ListItem>
        </Fragment>
      );
    });
  };

  return <List>{renderMenuIcons()}</List>;
}
