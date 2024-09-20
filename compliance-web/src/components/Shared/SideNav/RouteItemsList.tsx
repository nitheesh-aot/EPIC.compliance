import { FormatListBulletedRounded, AssessmentRounded, SettingsRounded } from "@mui/icons-material";

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
      icon: <FormatListBulletedRounded />,
      subRoutes: [
        {
          routeName: "Case Files",
          path: "/ce-database/case-files",
        },
        {
          routeName: "Inspections",
          path: "/ce-database/inspections",
        },
        {
          routeName: "Complaints",
          path: "/ce-database/complaints",
        },
      ],
    },
    {
      routeName: "IR Board",
      path: "/ir-board",
      icon: <AssessmentRounded sx={{ transform: "rotate(180deg)" }} />,
    },
    {
      routeName: "Admin",
      icon: <SettingsRounded />,
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
