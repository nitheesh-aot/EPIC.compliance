/// <reference types="cypress" />
import { mount } from "cypress/react18";
import RequirementSourceForm from "@/components/App/Complaints/RequirementSourceForm";
import { FormProvider, useForm } from "react-hook-form";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RequirementSource } from "@/models/RequirementSource";
import { Topic } from "@/models/Topic";
import { RequirementSourceEnum } from "@/utils/constants";
import ModalProvider from "@/components/Shared/Modals/ModalProvider";
import DrawerProvider from "@/components/Shared/Drawer/DrawerProvider";

// Mock data
const mockRequirementSources: RequirementSource[] = [
  { id: RequirementSourceEnum.SCHEDULE_B, name: "Schedule B" },
  { id: RequirementSourceEnum.EAC, name: "EAC" },
  { id: RequirementSourceEnum.ACT2018, name: "Act 2018" },
  { id: RequirementSourceEnum.OTHER, name: "Other" },
];

const mockTopics: Topic[] = [
  { id: 1, name: "Water" },
  { id: 2, name: "Air" },
  { id: 3, name: "Wildlife" },
];

describe("RequirementSourceForm Component", () => {
  const setup = (initialValues = {}) => {
    const queryClient = new QueryClient();

    // Create a wrapper component to provide react-hook-form context
    const Wrapper = ({ children }: { children: React.ReactNode }) => {
      const methods = useForm({
        defaultValues: {
          requirementSource: null,
          topic: null,
          conditionNumber: "",
          amendmentNumber: "",
          amendmentConditionNumber: "",
          conditionDescription: "",
          description: "",
          ...initialValues,
        },
      });

      return (
        <QueryClientProvider client={queryClient}>
          <DrawerProvider />
          <ModalProvider />
          <FormProvider {...methods}>{children}</FormProvider>
        </QueryClientProvider>
      );
    };

    mount(
      <Wrapper>
        <RequirementSourceForm
          requirementSourceList={mockRequirementSources}
          topicsList={mockTopics}
        />
      </Wrapper>
    );
  };

  it("renders the requirement source dropdown", () => {
    setup();
    cy.contains("Requirement Source").should("exist");
  });

  it("shows condition number field when Schedule B source is selected", () => {
    setup();

    // Select Schedule B as requirement source
    cy.get('input[name="requirementSource"]').click();
    cy.get("li").contains("Schedule B").click();

    // Check if Condition # field appears
    cy.contains("Condition #").should("exist");
    cy.get('textarea[name="conditionNumber"]').should("exist");
  });

  it("shows amendment fields when EAC source is selected", () => {
    setup();

    // Select EAC as requirement source
    cy.get('input[name="requirementSource"]').click();
    cy.get("li").contains("EAC").click();

    // Check if amendment fields appear
    cy.contains("Amendment #").should("exist");
    cy.contains("Amendment Condition #").should("exist");
    cy.contains("Condition Description").should("exist");

    cy.get('textarea[name="amendmentNumber"]').should("exist");
    cy.get('textarea[name="amendmentConditionNumber"]').should("exist");
    cy.get('textarea[name="conditionDescription"]').should("exist");
  });

  it("shows description field when Other source is selected", () => {
    setup();

    // Select Other as requirement source
    cy.get('input[name="requirementSource"]').click();
    cy.get("li").contains("Other").click();

    // Check if Description field appears
    cy.contains("Description").should("exist");
    cy.get('textarea[name="description"]').should("exist");
  });

  it("shows topic dropdown for any selected requirement source", () => {
    setup();

    // Select any requirement source
    cy.get('input[name="requirementSource"]').click();
    cy.get("li").contains("Schedule B").click();

    // Check if Topic dropdown appears
    cy.contains("Topic").should("exist");
    cy.get('input[name="topic"]').should("exist");
  });

  it("allows selecting a topic from the dropdown", () => {
    setup();

    // Select any requirement source
    cy.get('input[name="requirementSource"]').click();
    cy.get("li").contains("Schedule B").click();

    // Select a topic
    cy.get('input[name="topic"]').click();
    cy.get("li").contains("Water").click();

    // Verify selection
    cy.get('input[name="topic"]').should("have.value", "Water");
  });

  it("allows entering condition number for Schedule B", () => {
    setup();

    // Select Schedule B as requirement source
    cy.get('input[name="requirementSource"]').click();
    cy.get("li").contains("Schedule B").click();

    // Enter condition number
    cy.get('textarea[name="conditionNumber"]').type("B1");

    // Verify entered value
    cy.get('textarea[name="conditionNumber"]').should("have.value", "B1");
  });

  it("allows entering amendment details for EAC", () => {
    setup();

    // Select EAC as requirement source
    cy.get('input[name="requirementSource"]').click();
    cy.get("li").contains("EAC").click();

    // Enter amendment details
    cy.get('textarea[name="amendmentNumber"]').type("A1");
    cy.get('textarea[name="amendmentConditionNumber"]').type("C1");
    cy.get('textarea[name="conditionDescription"]').type(
      "Test condition description"
    );

    // Verify entered values
    cy.get('textarea[name="amendmentNumber"]').should("have.value", "A1");
    cy.get('textarea[name="amendmentConditionNumber"]').should("have.value", "C1");
    cy.get('textarea[name="conditionDescription"]').should(
      "have.value",
      "Test condition description"
    );
  });
});
