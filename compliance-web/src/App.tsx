import { ThemeProvider } from "@mui/material";
import { QueryClient } from "@tanstack/query-core";
import { QueryClientProvider } from "@tanstack/react-query";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "react-oidc-context";
import { OidcConfig } from "@/utils/config";
import { theme } from "@/styles/theme";
import RouterProviderWithAuthContext from "@/router";
import ModalProvider from "@/components/Shared/Modals/ModalProvider";
import SnackBarProvider from "@/components/Shared/Popups/SnackBarProvider";

const queryClient = new QueryClient();

function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <AuthProvider {...OidcConfig}>
            <ModalProvider />
            <SnackBarProvider />
            <RouterProviderWithAuthContext />
          </AuthProvider>
        </ThemeProvider>
        {/* <ReactQueryDevtools initialIsOpen={false}  /> */}
      </QueryClientProvider>
    </>
  );
}

export default App;
