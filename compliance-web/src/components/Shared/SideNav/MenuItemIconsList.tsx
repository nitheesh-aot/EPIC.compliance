import { theme } from "@/styles/theme";
import { ListItem, Box, List, Drawer } from "@mui/material";
import RouteItemsList, { RouteMenuItem } from "./RouteItemsList";
import { useMenuStore } from "@/store/menuStore";
import MenuItemsList from "./MenuItemsList";
import { useState } from "react";
import { APP_SIDE_NAV_WIDTH } from "@/utils/constants";

export default function MenuItemIconsList() {
  const routeMenuItems: RouteMenuItem[] = RouteItemsList();

  const { appHeaderHeight } = useMenuStore();

  const [hoverMenu, setHoverMenu] = useState<boolean>(false);

  const renderMenuIcons = () => {
    return routeMenuItems.map((route) => (
      <ListItem
        key={route.routeName}
        onMouseEnter={() => setHoverMenu(true)}
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
    ));
  };

  return (
    <>
      <List>{renderMenuIcons()}</List>
      <Drawer
        open={hoverMenu}
        variant="persistent"
        onMouseLeave={() => setHoverMenu(false)}
        sx={{
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: APP_SIDE_NAV_WIDTH,
            boxSizing: "border-box",
            background: theme.palette.primary.main,
            height: `calc(100vh - ${appHeaderHeight}px)`,
            top: appHeaderHeight,
          },
        }}
      >
        <MenuItemsList />
      </Drawer>
    </>
  );
}
