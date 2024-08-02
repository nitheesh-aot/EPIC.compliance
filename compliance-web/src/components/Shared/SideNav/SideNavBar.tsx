import {
  Box,
  List,
  ListItem,
  Typography,
  Button,
  Collapse,
} from "@mui/material";
import { Link } from "@tanstack/react-router";
import { theme } from "@/styles/theme";
import {
  ChevronLeft,
  ChevronRight,
  ExpandLess,
  ExpandMore,
} from "@mui/icons-material";
import MenuItems, { RouteMenuItem } from "./MenuItemsList";
import { Fragment, useState } from "react";

export default function SideNavBar() {
  const routeMenuItems = MenuItems();

  const [menuItemOpenList, setMenuItemOpenList] = useState<{
    [key: string]: boolean;
  }>({});
  const [expandMenu, setExpandMenu] = useState(true);

  const handleToggle = (routeName: string) => {
    setMenuItemOpenList((prevOpen) => ({
      ...prevOpen,
      [routeName]: !prevOpen[routeName],
    }));
  };

  const toggleExpandMenu = () => {
    setExpandMenu(!expandMenu);
  };

  const routeMenuTextStyle = {
    color: theme.palette.common.white,
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "1rem 1.5rem",
  };

  const routeMenuText = (route: RouteMenuItem) => (
    <>
      <Box display={"flex"} alignItems={"center"} gap={1}>
        {route.icon ?? route.icon}
        {route.routeName}
      </Box>
      {route.subRoutes &&
        (menuItemOpenList[route.routeName] ? <ExpandLess /> : <ExpandMore />)}
    </>
  );

  const renderMenuItems = (items: RouteMenuItem[]) => {
    return items.map((route) => {
      return (
        <Fragment key={route.routeName}>
          <ListItem
            key={route.routeName}
            onClick={() => handleToggle(route.routeName)}
            disablePadding
            sx={{ cursor: "pointer" }}
          >
            {!route.path && route.subRoutes ? (
              <Box sx={routeMenuTextStyle}>{routeMenuText(route)}</Box>
            ) : (
              <Link
                to={route.path}
                activeProps={{
                  style: {
                    color: theme.palette.secondary.main,
                    width: "100%",
                  },
                }}
                style={routeMenuTextStyle}
              >
                {routeMenuText(route)}
              </Link>
            )}
          </ListItem>
          {route.subRoutes && (
            <Collapse
              in={menuItemOpenList[route.routeName]}
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

  const renderMenuIcons = (items: RouteMenuItem[]) => {
    return items.map((route) => {
      return (
        <Fragment key={route.routeName}>
          <ListItem
            key={route.routeName}
            onClick={() => handleToggle(route.routeName)}
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

  return (
    <Box display={"flex"} alignItems={"flex-start"}>
      <Box
        bgcolor={theme.palette.primary.main}
        width={expandMenu ? 260 : 68}
        height={"100%"}
        display={"flex"}
        flexDirection={"column"}
        justifyContent={"space-between"}
      >
        {expandMenu ? (
          <List>{renderMenuItems(routeMenuItems)}</List>
        ) : (
          <List>{renderMenuIcons(routeMenuItems)}</List>
        )}
        <Typography
          variant="body1"
          color={theme.palette.common.white}
          textAlign={"center"}
          paddingBottom={"3rem"}
        >
          {expandMenu ? "Version: 1.0.1" : "1.0.1"}
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
          borderRadius: "0px 0.25rem 0.25rem 0",
        }}
        color="primary"
        onClick={toggleExpandMenu}
      >
        {expandMenu ? (
          <ChevronLeft fontSize={"large"} />
        ) : (
          <ChevronRight fontSize={"large"} />
        )}
      </Button>
    </Box>
  );
}
