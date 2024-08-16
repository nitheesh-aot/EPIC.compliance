/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from "react";
import Select from "react-select";
import Menu from "./components/Menu";
import Option from "./components/Option";
import MultiValue from "./components/MultiValueContainer";
import { OptionType, SelectProps } from "./type";
import SingleValue from "./components/SingleValueContainer";
import DropdownIndicator from "./components/DropDownIndicator";
import { useTheme } from "@mui/material";
import { BCDesignTokens } from "epic.theme";

const FilterSelect = (props: SelectProps) => {
  const theme = useTheme();
  const { name, isMulti, defaultValue } = props;
  const standardDefault = isMulti ? [] : "";
  const [options, setOptions] = useState<OptionType[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<any>();
  const [selectValue, setSelectValue] = useState<any>(
    defaultValue ?? standardDefault
  );
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuIsOpen, setMenuIsOpen] = useState<boolean>(!!props.menuIsOpen);
  const [menuStyle, setMenuStyle] = useState<any>({});
  const selectRef = useRef<any | null>(null);

  const selectAllOption = useMemo(
    () => ({
      label: "Select All",
      value: "<SELECT_ALL>",
    }),
    []
  );

  const isSelectAllSelected = () =>
    selectedOptions.includes(selectAllOption.value);

  const isOptionSelected = (o: OptionType) =>
    isMulti ? selectedOptions.includes(o.value) : selectedOptions === o.value;

  const handleChange = (newValue: any, actionMeta: any) => {
    if (!isMulti) {
      if (isOptionSelected(newValue)) {
        setSelectedOptions("");
      } else {
        setSelectedOptions(newValue.value);
      }
      return;
    }
    const { option } = actionMeta;
    if (option === undefined) return;

    if (option.value === selectAllOption.value) {
      if (isSelectAllSelected()) {
        setSelectedOptions([]);
      } else {
        const options = [...(props.options?.map((o: any) => o.value) || [])];
        setSelectedOptions([selectAllOption.value, ...options]);
      }
    } else {
      if (isOptionSelected(option)) {
        setSelectedOptions(
          selectedOptions.filter(
            (o: string) => o !== option.value && o !== selectAllOption.value
          )
        );
      } else {
        let value = [...selectedOptions, option.value];
        value = Array.from(new Set<string>(value));
        setSelectedOptions(value || []);
      }
    }
  };

  const applyFilters = () => {
    if (props.filterAppliedCallback) {
      const options = isMulti
        ? (selectedOptions as string[]).filter(
            (p) => p !== selectAllOption.value
          )
        : selectedOptions;
      props.filterAppliedCallback(options);
    }
    if (selectedOptions.length === 0) {
      selectRef.current?.clearValue();
    }
    if (isMulti) {
      const value = options.filter((o: OptionType) =>
        selectedOptions.includes(o.value)
      );
      setSelectValue(value);
    } else {
      const value = options.find(
        (o: OptionType) => o.value === selectedOptions
      );
      setSelectValue(value);
    }
    setMenuIsOpen(false);
    selectRef.current?.blur();
  };

  const clearFilters = () => {
    setSelectedOptions([]);
    setSelectValue(isMulti ? [] : "");
    if (props.filterClearedCallback) {
      props.filterClearedCallback(isMulti ? [] : "");
    }
    selectRef.current?.clearValue();
  };

  const onCancel = () => {
    const currentValues = isMulti
      ? selectValue.map((v: OptionType) => v.value)
      : selectValue.value;
    setSelectedOptions(currentValues || isMulti ? [] : "");
    setMenuIsOpen(false);
    selectRef.current?.blur();
  };

  const adjustDropdownPosition = () => {
    if (menuRef?.current) {
      const menuRect = menuRef.current.getBoundingClientRect();
      const windowWidth = window.innerWidth - 50;
      const rightEdgeOfMenu = menuRect.left + menuRect.width;

      if (rightEdgeOfMenu > windowWidth) {
        const overflow = rightEdgeOfMenu - windowWidth;
        const newPosition = {
          transform: `translateX(${-(overflow + 80)}px)`,
        };
        setMenuStyle(newPosition);
      } else {
        setMenuStyle({});
      }
    }
  };

  useEffect(() => {
    if (menuIsOpen) {
      adjustDropdownPosition();
      const currentValues = isMulti
        ? selectValue.map((v: OptionType) => v.value)
        : selectValue.value;
      setSelectedOptions(currentValues);
    }
  }, [isMulti, menuIsOpen, selectValue]);

  useEffect(() => {
    let filterOptions = props.options as OptionType[];
    if (isMulti) filterOptions = [selectAllOption, ...filterOptions];
    setOptions(filterOptions);
  }, [isMulti, props.options, selectAllOption]);

  const isSearchable = () => {
    if (props.isSearchable !== undefined) return props.isSearchable;

    if (selectValue instanceof Array) {
      return selectValue.length === 0;
    }

    return !selectValue;
  };

  useEffect(() => {
    if (
      props.value !== undefined &&
      selectValue !== undefined &&
      JSON.stringify(selectValue) !== JSON.stringify(props.value)
    ) {
      setSelectValue(props.value);
    }
  }, [props.value, selectValue]);

  return (
    <div ref={menuRef}>
      <Select
        value={selectValue}
        placeholder={props.placeholder || "Filter"}
        onMenuClose={onCancel}
        name={name}
        options={options}
        isMulti={isMulti}
        onChange={handleChange}
        components={{
          Option,
          Menu,
          MultiValue,
          SingleValue,
          IndicatorSeparator: () => null,
          DropdownIndicator,
        }}
        filterProps={{
          applyFilters,
          clearFilters,
          selectedOptions,
          onCancel,
          variant: props.variant || "inline",
        }}
        menuIsOpen={menuIsOpen}
        closeMenuOnSelect={false}
        hideSelectedOptions={false}
        onFocus={() => setMenuIsOpen(true)}
        onBlur={() => setMenuIsOpen(false)}
        ref={selectRef}
        styles={{
          option: (base, provided) => ({
            ...base,
            whiteSpace: "normal",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "flex",
            alignItems: "center",
            padding: ".5rem .75rem .5rem 0px",
            fontSize: BCDesignTokens.typographyFontSizeBody,
            maxWidth: props.maxWidth ?? "100%",
            background: provided.isFocused
              ? BCDesignTokens.themeGray20
              : "transparent",
            color: provided.isSelected
              ? BCDesignTokens.themePrimaryBlue
              : BCDesignTokens.themeGray90,
            cursor: provided.isFocused ? "pointer" : "default",
          }),
          control: (base, props) => ({
            ...base,
            background: props.hasValue
              ? BCDesignTokens.surfaceColorBackgroundLightBlue
              : BCDesignTokens.themeGrayWhite,
            height: "2.25rem",
            minHeight: "2.25rem",
            borderWidth: "1px",
            borderStyle: props.hasValue ? "none" : "solid",
            borderColor:
              props.isFocused || props.menuIsOpen
                ? BCDesignTokens.surfaceColorBorderActive
                : BCDesignTokens.surfaceColorBorderDefault,
            boxShadow: "none",
            ...(props.selectProps.filterProps?.variant === "bar" && {
              borderColor: props.isFocused
                ? BCDesignTokens.surfaceColorBorderActive
                : "transparent",
            }),
          }),
          menu: (base) => ({
            ...base,
            position: "relative",
            marginBlock: "0px",
            border: `1px solid ${BCDesignTokens.surfaceColorBorderDefault}`,
            borderRadius: "4px",
            ...menuStyle,
          }),
          placeholder: (base, props) => ({
            ...base,
            fontWeight: BCDesignTokens.typographyFontWeightsRegular,
            color: BCDesignTokens.typographyColorPlaceholder,
            fontSize: BCDesignTokens.typographyFontSizeSmallBody,
            lineHeight: "1rem",
            paddingLeft: "0.25rem",
            ...(props.selectProps.filterProps?.variant == "bar" && {
              color: BCDesignTokens.themePrimaryBlue,
              fontWeight: BCDesignTokens.typographyFontWeightsBold,
            }),
          }),
          menuPortal: (base) => ({
            ...base,
            zIndex: theme.zIndex.modal,
            marginTop: "4px",
          }),
          input: (base) => ({
            ...base,
            fontWeight: "400",
            fontSize: BCDesignTokens.typographyFontSizeSmallBody,
            paddingLeft: "0.25rem",
          }),
        }}
        isClearable={false}
        menuPortalTarget={document.body}
        controlShouldRenderValue={props.controlShouldRenderValue}
        isLoading={props.isLoading}
        loadingMessage={() => "Loading..."}
        isDisabled={props.isDisabled}
        isSearchable={isSearchable()}
      />
    </div>
  );
};

export default FilterSelect;
