/* eslint-disable @typescript-eslint/no-explicit-any */
import { mount } from "cypress/react18";
import { MRT_TableInstance } from "material-react-table";
import { FiltersCache } from "../FiltersCache";
import React from "react";

describe("FiltersCache Component", () => {
  it("calls onCacheFilters with the current column filters when mounted", () => {
    const onCacheFilters = cy.stub().as("onCacheFiltersStub");

    const tableMock = {
      getState: () => ({
        columnFilters: [{ id: "name", value: "John" }],
      }),
    } as MRT_TableInstance<any>;

    mount(<FiltersCache onCacheFilters={onCacheFilters} table={tableMock} />);

    // Verify that onCacheFilters was called with the correct filters
    cy.get("@onCacheFiltersStub").should("have.been.calledOnceWith", [
      { id: "name", value: "John" },
    ]);
  });

  it("calls onCacheFilters again when the table instance changes", () => {
    const onCacheFilters = cy.stub().as("onCacheFiltersStub");

    const tableMock1 = {
      getState: () => ({
        columnFilters: [{ id: "name", value: "John" }],
      }),
    } as MRT_TableInstance<any>;

    const tableMock2 = {
      getState: () => ({
        columnFilters: [{ id: "email", value: "john.doe@example.com" }],
      }),
    } as MRT_TableInstance<any>;

    mount(<FiltersCache onCacheFilters={onCacheFilters} table={tableMock1} />);

    // Verify that onCacheFilters was called initially
    cy.get("@onCacheFiltersStub").should("have.been.calledOnceWith", [
      { id: "name", value: "John" },
    ]);

    // Now remount the component with a new table instance
    mount(<FiltersCache onCacheFilters={onCacheFilters} table={tableMock2} />);

    // Verify that onCacheFilters was called again with the updated filters
    cy.get("@onCacheFiltersStub").should("have.been.calledWith", [
      { id: "email", value: "john.doe@example.com" },
    ]);
  });
});
