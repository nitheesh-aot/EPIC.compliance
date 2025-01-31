/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import Select, {
  ControlProps,
  CSSObjectWithLabel,
  GroupBase,
  OptionProps,
  PlaceholderProps,
} from "react-select";
import Menu from "./components/Menu";
import Option from "./components/Option";
import MultiValue from "./components/MultiValueContainer";
import { OptionType, SelectProps } from "./type";
import SingleValue from "./components/SingleValueContainer";
import DropdownIndicator from "./components/DropDownIndicator";
import { useTheme } from "@mui/material";
import { BCDesignTokens } from "epic.theme";
import React from "react";

const FilterSelect = React.memo((props: SelectProps) => {
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

  const isOptionSelected = useCallback(
    (o: OptionType) =>
      isMulti ? selectedOptions.includes(o.value) : selectedOptions === o.value,
    [isMulti, selectedOptions]
  );

  const applyFilters = useCallback(() => {
    if (!selectedOptions) return;
    if (props.filterAppliedCallback) {
      const options = selectedOptions;
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
  }, [props, selectedOptions, isMulti, options]);

  const handleChange = useCallback(
    (newValue: any, actionMeta: any) => {
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

      if (isOptionSelected(option)) {
        setSelectedOptions(
          selectedOptions.filter((o: string) => o !== option.value)
        );
      } else {
        let value = [...selectedOptions, option.value];
        value = Array.from(new Set<string>(value));
        setSelectedOptions(value || []);
      }
    },
    [isMulti, isOptionSelected, selectedOptions]
  );

  useEffect(() => {
    applyFilters();
  }, [selectedOptions, applyFilters]);

  const clearFilters = () => {
    setSelectedOptions([]);
    setSelectValue(isMulti ? [] : "");
    if (props.filterClearedCallback) {
      props.filterClearedCallback(isMulti ? [] : "");
    }
    selectRef.current?.clearValue();
  };

  const onCancel = () => {
    setMenuIsOpen(false);
    selectRef.current?.blur();
  };

  const adjustDropdownPosition = useCallback(() => {
    if (menuRef?.current) {
      const menuRect = menuRef.current.getBoundingClientRect();
      const windowWidth = window.innerWidth - 50;
      const rightEdgeOfMenu = menuRect.left + menuRect.width;

      if (rightEdgeOfMenu > windowWidth) {
        const overflow = rightEdgeOfMenu - windowWidth;
        const newPosition = {
          transform: `translateX(${-(overflow + 50)}px)`,
        };
        setMenuStyle(newPosition);
      } else {
        setMenuStyle({});
      }
    }
  }, []);

  const updateSelectedOptions = useCallback(() => {
    const currentValues = isMulti
      ? selectValue.map((v: OptionType) => v.value)
      : selectValue.value;
    setSelectedOptions(currentValues);
  }, [isMulti, selectValue]);

  useEffect(() => {
    if (menuIsOpen) {
      adjustDropdownPosition();
      updateSelectedOptions();
    }
  }, [adjustDropdownPosition, menuIsOpen, updateSelectedOptions]);

  useEffect(() => {
    if (JSON.stringify(options) !== JSON.stringify(props.options)) {
      setOptions(props.options as OptionType[]);
    }
  }, [props.options, options]);

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

  const styles = useMemo(
    () => ({
      option: (
        base: CSSObjectWithLabel,
        provided: OptionProps<unknown, boolean, GroupBase<unknown>>
      ) => ({
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
      control: (
        base: CSSObjectWithLabel,
        props: ControlProps<unknown, boolean, GroupBase<unknown>>
      ) => ({
        ...base,
        background: props.hasValue
          ? BCDesignTokens.surfaceColorBackgroundLightBlue
          : BCDesignTokens.themeGrayWhite,
        height: "2.25rem",
        minHeight: "2.25rem",
        borderWidth: "1px",
        // borderStyle: props.hasValue ? "none" : "solid",
        borderColor:
          props.isFocused || props.menuIsOpen
            ? BCDesignTokens.surfaceColorBorderActive
            : props.hasValue
              ? BCDesignTokens.themeBlue20
              : BCDesignTokens.surfaceColorBorderDefault,
        boxShadow: "none",
        ...(props.selectProps.filterProps?.variant === "bar" && {
          borderColor: props.isFocused
            ? BCDesignTokens.surfaceColorBorderActive
            : "transparent",
        }),
        cursor: "pointer",
      }),
      menu: (base: CSSObjectWithLabel) => ({
        ...base,
        position: "relative",
        marginBlock: "0px",
        border: `1px solid ${BCDesignTokens.surfaceColorBorderDefault}`,
        borderRadius: "4px",
        paddingBottom: "0.25rem",
        ...menuStyle,
      }),
      placeholder: (
        base: CSSObjectWithLabel,
        props: PlaceholderProps<unknown, boolean, GroupBase<unknown>>
      ) => ({
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
      menuPortal: (base: CSSObjectWithLabel) => ({
        ...base,
        zIndex: theme.zIndex.modal,
        marginTop: "4px",
      }),
      input: (base: CSSObjectWithLabel) => ({
        ...base,
        fontWeight: "400",
        fontSize: BCDesignTokens.typographyFontSizeSmallBody,
        paddingLeft: "0.25rem",
      }),
    }),
    [menuStyle, props.maxWidth, theme.zIndex.modal]
  );

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
        styles={styles}
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
});

export default FilterSelect;
