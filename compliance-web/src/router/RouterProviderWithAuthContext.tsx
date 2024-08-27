import { RouterProvider } from "@tanstack/react-router";
import { useAuth } from "react-oidc-context";
import router from "./router";

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function RouterProviderWithAuthContext() {
  const authentication = useAuth();
  return <RouterProvider router={router} context={{ authentication }} />
}
