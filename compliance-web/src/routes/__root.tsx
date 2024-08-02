import EAOAppBar from "@/components/Shared/EAOAppBar";
import PageNotFound from "@/components/Shared/PageNotFound";
import SideNavBar from "@/components/Shared/SideNav/SideNavBar";
import { Box } from "@mui/system";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { AuthContextProps } from "react-oidc-context";

type RouterContext = {
  authentication: AuthContextProps;
};

export const Route = createRootRouteWithContext<RouterContext>()({
  component: Layout,
  notFoundComponent: PageNotFound,
});

function Layout() {
  return (
    <>
      <EAOAppBar />
      <Box display={"flex"} height={"calc(100vh - 112px)"} overflow={"hidden"}>
        <SideNavBar />
        <Box
          display={"flex"}
          flexDirection={"column"}
          flex={1}
          padding={"3.625rem 2.5rem 0 0"}
          marginBottom={"1rem"}
          overflow={"auto"}
        >
          <Outlet />
        </Box>
      </Box>
      <TanStackRouterDevtools />
    </>
  );
}
