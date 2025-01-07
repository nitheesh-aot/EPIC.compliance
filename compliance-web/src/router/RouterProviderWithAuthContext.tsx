import { RouterProvider } from "@tanstack/react-router";
import { useAuth } from "react-oidc-context";
import router from "./router";
import { useEffect } from "react";

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function RouterProviderWithAuthContext() {
  const authentication = useAuth();

  useEffect(() => {
    // the `return` is important - addAccessTokenExpiring() returns a cleanup function
    // eslint-disable-next-line no-console
    console.log(
      "authentication",
      authentication.user?.expires_in,
      new Date((authentication.user?.expires_at as number) * 1000)
    );
    return authentication.events.addAccessTokenExpiring(() => {
      // eslint-disable-next-line no-console
      console.log(
        "AccessTokenExpiring"
      );
      authentication.signinSilent();
    });
  }, [authentication, authentication.events, authentication.signinSilent]);

  return <RouterProvider router={router} context={{ authentication }} />;
}
