import { ComponentType, FC, useCallback, useMemo, memo } from "react";
import FilterSelect from "./FilterSelect";
import { ExternalTableFilterProps } from "./type";

const makeExternalTableFilter =
  <SelectProps extends object>(
    Component: ComponentType<SelectProps>
  ): FC<ExternalTableFilterProps> =>
  memo(({ filterId, filterOptions, onFilterChange, isMulti = true, ...props }: ExternalTableFilterProps) => {
    const filterAppliedCallback = useCallback(
      (selectedOptions: string[] | string) => {
        onFilterChange(filterId, selectedOptions);
      },
      [filterId, onFilterChange]
    );

    const filterClearedCallback = useCallback(
      (value: [] | string) => {
        onFilterChange(filterId, value);
      },
      [filterId, onFilterChange]
    );

    const toOptionType = useCallback((
      option: string | { text: string; value: unknown }
    ) => {
      if (typeof option === "object") {
        return { label: option.text, value: option.value };
      }
      return { label: option, value: option };
    }, []);

    const options = useMemo(() => {
      const filterOptionsList = filterOptions.map(
        (
          option:
            | string
            | {
                text: string;
                value: unknown;
              }
        ) => toOptionType(option)
      );
      return filterOptionsList.sort((a, b) => a.label.localeCompare(b.label));
    }, [filterOptions, toOptionType]);

    return (
      <Component
        {...(props as SelectProps)}
        options={options}
        filterAppliedCallback={filterAppliedCallback}
        filterClearedCallback={filterClearedCallback}
        defaultValue={isMulti ? [] : ""}
        isMulti={isMulti}
      />
    );
  });

const ExternalTableFilter = makeExternalTableFilter(FilterSelect);
ExternalTableFilter.displayName = 'ExternalTableFilter';
export default ExternalTableFilter; 
