/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { GroupBase, Props } from "react-select";
import type {} from 'react-select/base';

export interface OptionType {
  readonly value: string | number;
  readonly label: string;
}

declare module "react-select/base" {
  export interface Props<
    Option,
    IsMulti extends boolean,
    Group extends GroupBase<Option> = GroupBase<Option>,
  > {
    // Marking as optional here to not raise errors for ControlledSelect
    // Make sure to add for FilterSelect
    filterProps?: {
      applyFilters?: () => void;
      clearFilters?: () => void;
      selectedOptions: any[];
      options?: any[];
      variant?: "inline" | "bar" | "inline-standalone";
      label?: string;
      maxWidth?: string;
      onCancel?: () => void;
      getOptionLabel?: (option: any) => string;
      getOptionValue?: (option: any) => string;
    };
    filterAppliedCallback?: (value?: string[] | string) => void;
    filterClearedCallback?: (value?: [] | "") => void;
  }
}

export type SelectProps = {
  variant: "inline" | "bar" | "inline-standalone";
  info?: boolean;
  maxWidth?: string;
  filterAppliedCallback?: (selectedOptions: string[] | string) => void;
  filterClearedCallback?: (value: [] | string) => void;
} & Props<OptionType>;

export type TableFilterProps = {
  header: any;
  column: any;
} & SelectProps;
