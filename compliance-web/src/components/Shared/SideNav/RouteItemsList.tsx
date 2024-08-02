import { Assessment, Settings, List } from "@mui/icons-material";

export interface RouteMenuItem {
  routeName: string;
  path?: string;
  icon?: JSX.Element;
  subRoutes?: RouteMenuItem[];
}

export default function RouteItemsList() {
  const routeMenuItems: RouteMenuItem[] = [
    {
      routeName: "C&E Database",
      icon: <List />,
      subRoutes: [
        {
          routeName: "Case Files",
          path: "/ce-database/case-files",
        },
        {
          routeName: "Inspections",
          path: "/ce-database/inspection",
        },
        {
          routeName: "Complaints",
          path: "/ce-database/compliants",
        },
      ],
    },
    {
      routeName: "IR Board",
      path: "/ir-board",
      icon: <Assessment sx={{ transform: "rotate(180deg)" }} />,
    },
    {
      routeName: "Admin",
      icon: <Settings />,
      subRoutes: [
        {
          routeName: "Staff",
          path: "/admin/staff",
        },
        {
          routeName: "Proponents",
          path: "/admin/proponents",
        },
        {
          routeName: "Agencies",
          path: "/admin/agencies",
        },
        {
          routeName: "Topics",
          path: "/admin/topics",
        },
      ],
    },
  ];

  return routeMenuItems;
}
