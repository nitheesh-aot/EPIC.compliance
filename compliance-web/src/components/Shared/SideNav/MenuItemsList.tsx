import { theme } from "@/styles/theme";
import { ListItem, Box, Collapse, List, styled } from "@mui/material";
import { Fragment } from "react/jsx-runtime";
import RouteItemsList, { RouteMenuItem } from "./RouteItemsList";
import { Link } from "@tanstack/react-router";
import { useMenuStore } from "@/store/menuStore";
import { ExpandLess, ExpandMore } from "@mui/icons-material";

export default function MenuItems() {
  const routeMenuItems: RouteMenuItem[] = RouteItemsList();

  const { openMenus, toggleMenu } = useMenuStore();

  const routeMenuTextStyle = {
    color: theme.palette.common.white,
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "1rem 1.5rem",
    "&:hover": {
      color: theme.palette.secondary.main,
    },
  };

  const StyledLink = styled(Link)(() => routeMenuTextStyle);

  const routeMenuText = (route: RouteMenuItem) => (
    <>
      <Box display={"flex"} alignItems={"center"} gap={1}>
        {route.icon ?? route.icon}
        {route.routeName}
      </Box>
      {route.subRoutes &&
        (openMenus[route.routeName] ? <ExpandLess /> : <ExpandMore />)}
    </>
  );

  const renderMenuItems = (items: RouteMenuItem[]) => {
    return items.map((route) => {
      return (
        <Fragment key={route.routeName}>
          <ListItem
            key={route.routeName}
            onClick={() => toggleMenu(route.routeName)}
            disablePadding
            sx={{ cursor: "pointer" }}
          >
            {!route.path && route.subRoutes ? (
              <Box sx={routeMenuTextStyle}>{routeMenuText(route)}</Box>
            ) : (
              <StyledLink
                to={route.path}
                activeProps={{
                  style: {
                    color: theme.palette.secondary.main,
                    width: "100%",
                  },
                }}
              >
                {routeMenuText(route)}
              </StyledLink>
            )}
          </ListItem>
          {route.subRoutes && (
            <Collapse
              in={openMenus[route.routeName]}
              timeout="auto"
              unmountOnExit
            >
              <List disablePadding sx={{ marginLeft: "2rem" }}>
                {renderMenuItems(route.subRoutes)}
              </List>
            </Collapse>
          )}
        </Fragment>
      );
    });
  };

  return <List>{renderMenuItems(routeMenuItems)}</List>;
}
