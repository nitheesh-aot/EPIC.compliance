// cypress/component/ControlledAutoComplete.cy.tsx

import { mount } from "cypress/react18";
import { useForm, FormProvider } from "react-hook-form";
import ControlledAutoComplete from "@/components/Shared/Controlled/ControlledAutoComplete";

interface Option {
  label: string;
  value: string;
}

const options: Option[] = [
  { label: "Option 1", value: "option1" },
  { label: "Option 2", value: "option2" },
  { label: "Option 3", value: "option3" },
];

const TestComponent = () => {
  const methods = useForm({
    defaultValues: {
      testAutocomplete: null,
    },
  });

  return (
    <FormProvider {...methods}>
      <form>
        <ControlledAutoComplete<Option>
          name="testAutocomplete"
          label="Test Autocomplete"
          options={options}
          getOptionLabel={(option) => option.label}
          isOptionEqualToValue={(option, value) => option.value === value.value}
        />
      </form>
    </FormProvider>
  );
};

describe("ControlledAutoComplete", () => {
  it("renders correctly", () => {
    mount(<TestComponent />);
    cy.get("input[name='testAutocomplete']").should("exist");
  });

  it("displays options when focused", () => {
    mount(<TestComponent />);
    cy.get("input[name='testAutocomplete']").click();
    cy.get("li[data-option-index]").should("have.length", options.length);
  });

  it("allows selecting an option", () => {
    mount(<TestComponent />);
    cy.get("input[name='testAutocomplete']").click();
    cy.get("li[data-option-index='0']").click();
    cy.get("input[name='testAutocomplete']").should(
      "have.value",
      options[0].label
    );
  });

  it("displays an error message when validation fails", () => {
    const errorMessage = "This field is required";
    const TestComponentWithValidation = () => {
      const methods = useForm({
        defaultValues: {
          testAutocomplete: null,
        },
        mode: "onSubmit",
        resolver: async (data) => {
          return {
            values: data,
            errors: data.testAutocomplete
              ? {}
              : { testAutocomplete: { message: errorMessage } },
          };
        },
      });

      return (
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(() => {})}>
            <ControlledAutoComplete<Option>
              name="testAutocomplete"
              label="Test Autocomplete"
              options={options}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) =>
                option.value === value.value
              }
            />
            <button type="submit">Submit</button>
          </form>
        </FormProvider>
      );
    };

    mount(<TestComponentWithValidation />);
    cy.get("button[type='submit']").click();
    cy.get("p.Mui-error").should("contain.text", errorMessage);
  });
});
