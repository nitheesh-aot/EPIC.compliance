import EAOAppBar from "@/components/Shared/Header/EAOAppBar";
import PageNotFound from "@/components/Shared/PageNotFound";
import SideNavBar from "@/components/Shared/SideNav/SideNavBar";
import { useMenuStore } from "@/store/menuStore";
import { Box } from "@mui/system";
import {
  createRootRouteWithContext,
  Outlet,
  useMatches,
} from "@tanstack/react-router";
// import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { useRef, useEffect } from "react";
import { AuthContextProps } from "react-oidc-context";

type RouterContext = {
  authentication: AuthContextProps;
};

export const Route = createRootRouteWithContext<RouterContext>()({
  component: Layout,
  notFoundComponent: PageNotFound,
});

function Layout() {
  const { appHeaderHeight, setAppHeaderHeight } = useMenuStore();
  const appBarRef = useRef<HTMLDivElement | null>(null);

  const matches = useMatches();

  const isProfileLayout = matches.some((route) =>
    [
      "/_authenticated/ce-database/case-files/$caseFileNumber",
      "/_authenticated/ce-database/inspections/$inspectionNumber",
      "/_authenticated/ce-database/complaints/$complaintNumber",
    ].includes(route.routeId)
  );

  useEffect(() => {
    if (appBarRef.current) {
      setAppHeaderHeight(appBarRef.current.offsetHeight);
    }
  }, [setAppHeaderHeight]);

  return (
    <>
      <EAOAppBar ref={appBarRef} />
      <Box
        sx={{
          display: "flex",
          overflow: "hidden",
          height: `calc(100vh - ${appHeaderHeight}px)`,
        }}
      >
        <SideNavBar />
        <Box
          display={"flex"}
          flexDirection={"column"}
          flex={1}
          padding={isProfileLayout ? "" : "3.625rem 2.5rem 0 0"}
          marginBottom={isProfileLayout ? "" : "1rem"}
          marginLeft={isProfileLayout ? "-3rem" : "0"}
          overflow={"auto"}
        >
          <Outlet />
        </Box>
      </Box>
      {/* <TanStackRouterDevtools /> */}
    </>
  );
}
