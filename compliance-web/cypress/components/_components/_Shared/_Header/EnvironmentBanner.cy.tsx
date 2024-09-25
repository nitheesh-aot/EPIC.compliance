import { mount } from "cypress/react";
import EnvironmentBanner from "@/components/Shared/Header/EnvironmentBanner";
import { AppConfig } from "@/utils/config";
import { createAppTheme } from "epic.theme";
import { ThemeProvider } from "@mui/material";

// Stub the AppConfig
const mockAppConfig = (env) => {
  cy.stub(AppConfig, "environment").value(env);
};



describe("EnvironmentBanner Component", () => {
  const theme = createAppTheme();

  const renderComponent = () => {
    return mount(
      <ThemeProvider theme={theme}>
        <EnvironmentBanner />
      </ThemeProvider>
    );
  };
  
  it("should not display the banner if environment is not in the test list", () => {
    mockAppConfig("production");

    renderComponent();

    cy.get("div")
      .should("have.css", "height", "8px"); // Assuming secondary.main is yellow
  });

  it("should display the banner with environment details if environment is in the test list", () => {
    mockAppConfig("dev");

    renderComponent();

    cy.get("div")
      .should("have.css", "height", "40px")
      .and("contain", "You are using a DEV environment");
  });
});
