import { mount } from "cypress/react18"; // or `cypress/react18` if using React 18
import { ThemeProvider } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "react-oidc-context";
import { OidcConfig } from "@/utils/config";
import { theme } from "@/styles/theme";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "@/routeTree.gen";
import React from "react";

const queryClient = new QueryClient();

const router = createRouter({
  routeTree,
  context: {
    authentication: undefined!,
  },
});

function TestApp({ authentication }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <AuthProvider {...OidcConfig}>
          <RouterProvider router={router} context={{ authentication }} />
        </AuthProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

describe("<App />", () => {
  it("renders", () => {
    const mockAuth = {
      // mock the necessary properties and methods for useAuth context
      isAuthenticated: true,
      user: { profile: { name: "Test User" } },
      signoutRedirect: cy.stub(),
      signinRedirect: cy.stub(),
      // add other necessary mocks here
    };
    mount(<TestApp authentication={mockAuth} />);
    cy.contains("Users");
  });
});