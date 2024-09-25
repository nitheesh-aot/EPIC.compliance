/// <reference types="cypress" />
import {
  exportToCsv,
  getSelectFilterOptions,
  rowsPerPageOptions,
  searchFilter,
} from "@/components/Shared/MasterDataTable/utils";
import { MRT_RowData, MRT_TableInstance } from "material-react-table";

describe("Utility Functions", () => {
  describe("getSelectFilterOptions", () => {
    it("returns formatted options with proper labels and values", () => {
      const mockData = [
        { id: 1, name: "Option 1" },
        { id: 2, name: "Option 2" },
        { id: 3, name: null },
      ];

      const options = getSelectFilterOptions(mockData, "name");

      expect(options).to.deep.equal([
        { text: "(Blanks)", value: "" },
        { text: "Option 1", value: "Option 1" },
        { text: "Option 2", value: "Option 2" },
      ]);
    });

    it("sorts options correctly, placing blanks at the top", () => {
      const mockData = [
        { id: 1, name: "Zebra" },
        { id: 2, name: "Apple" },
        { id: 3, name: null },
      ];

      const options = getSelectFilterOptions(mockData, "name");

      expect(options).to.deep.equal([
        { text: "(Blanks)", value: "" },
        { text: "Apple", value: "Apple" },
        { text: "Zebra", value: "Zebra" },
      ]);
    });
  });

  describe("rowsPerPageOptions", () => {
    it("returns default options when no data size is provided", () => {
      const options = rowsPerPageOptions();
      expect(options).to.deep.equal([
        { value: 15, label: "15" },
        { value: 10, label: "All" },
      ]);
    });

    it("returns options with a custom data size", () => {
      const options = rowsPerPageOptions(20);
      expect(options).to.deep.equal([
        { value: 15, label: "15" },
        { value: 20, label: "All" },
      ]);
    });
  });

  describe("exportToCsv", () => {
    it("exports table data to CSV correctly", async () => {
      // Create a more complete mock of MRT_TableInstance
      const mockTable = {
        getVisibleFlatColumns: () => [
          { columnDef: { id: "name" } },
          { columnDef: { id: "age" } },
        ],
        getFilteredRowModel: () => ({
          flatRows: [
            {
              getValue: (column: string) => (column === "name" ? "John Doe" : 30),
            },
            {
              getValue: (column: string) => (column === "name" ? "Jane Smith" : 25),
            },
          ],
        }),
        // Adding a few more properties to avoid type errors
        getState: () => ({}),
        getAllColumns: () => [],
        getAllFlatColumns: () => [],
        getAllLeafColumns: () => [],
        getBottomRows: () => [],
        getCenterLeafColumns: () => [],
        getFlatHeaders: () => [],
        getHeaderGroups: () => [],
        getRowModel: () => ({ rows: [] }),
        getSortedRowModel: () => ({ rows: [] }),
        getPreFilteredRowModel: () => ({ rows: [] }),
      } as unknown as MRT_TableInstance<MRT_RowData>;
  
      // Spy on createObjectURL to ensure export is working
      cy.spy(window.URL, "createObjectURL").as("createObjectURL");
  
      await exportToCsv({
        table: mockTable,
        downloadDate: "2024-01-01",
        filenamePrefix: "staff",
      });
  
      // Validate that URL.createObjectURL was called, indicating CSV generation worked
      cy.get("@createObjectURL").should("be.calledOnce");
    });
  });

  describe("searchFilter", () => {
    it("returns true when filter value is a substring of the row value", () => {
      const row = {
        getValue: () => "apple pie",
      };
  
      const result = searchFilter(row, "id", "apple");
      expect(result).to.be.true;
    });
  
    it("returns false when filter value is not present in the row value", () => {
      const row = {
        getValue: () => "apple pie",
      };
  
      const result = searchFilter(row, "id", "banana");
      expect(result).to.be.false;
    });
  
    it("returns true when filter value is an array containing a matching substring", () => {
      const row = {
        getValue: () => "apple pie",
      };
  
      const result = searchFilter(row, "id", ["apple", "banana"]);
      expect(result).to.be.true;
    });
  
    it("returns false when filter value is an array not containing any matching substrings", () => {
      const row = {
        getValue: () => "apple pie",
      };
  
      const result = searchFilter(row, "id", ["banana", "cherry"]);
      expect(result).to.be.false;
    });
  });
});
