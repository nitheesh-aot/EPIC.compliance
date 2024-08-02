import { Assessment, Settings, List } from "@mui/icons-material";
import { useAuth } from "react-oidc-context";

export interface RouteMenuItem {
  routeName: string;
  path?: string;
  icon?: JSX.Element;
  subRoutes?: RouteMenuItem[];
}

export default function MenuItemsList() {
  const { isAuthenticated } = useAuth();

  let routeMenuItems: RouteMenuItem[] = [
    {
      routeName: "C&E Database",
      icon: <List />,
      subRoutes: [
        {
          routeName: "Case Files",
          path: "/",
        },
        {
          routeName: "Inspections",
          path: "/link1",
        },
        {
          routeName: "Complaints",
          path: "/link2",
        },
      ],
    },
    {
      routeName: "IR Board",
      path: "/about",
      icon: <Assessment sx={{ transform: "rotate(180deg)" }} />,
    },
    {
      routeName: "Admin",
      icon: <Settings />,
      subRoutes: [
        {
          routeName: "Staff",
          path: "/newpage",
        },
        {
          routeName: "Proponents",
          path: "/link1",
        },
        {
          routeName: "Agencies",
          path: "/link2",
        },
        {
          routeName: "Topics",
          path: "/link3",
        },
      ],
    },
  ];

  const authenticatedRouteMenuItems: RouteMenuItem[] = [];

  if (isAuthenticated) {
    routeMenuItems = routeMenuItems.concat(authenticatedRouteMenuItems);
  }

  return routeMenuItems;
}
