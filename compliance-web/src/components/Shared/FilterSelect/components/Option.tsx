import { useEffect, useMemo, useState } from "react";
import { components, OptionProps } from "react-select";
import Checkbox from "@mui/material/Checkbox";
import { OptionType } from "../type";
import { Box, Radio } from "@mui/material";

const Option = ({
  getStyles,
  isDisabled,
  isFocused,
  children,
  innerProps,
  isMulti,
  ...rest
}: OptionProps) => {
  const data = useMemo(() => rest.data as OptionType, [rest.data]);
  const { filterProps } = rest.selectProps;

  const [isSelected, setIsSelected] = useState(false);

  useEffect(() => {
    if (filterProps?.selectedOptions) {
      setIsSelected(filterProps?.selectedOptions.indexOf(data.value) > -1);
    }
  }, [data.value, filterProps?.selectedOptions]);

  return (
    <Box title={data.label}>
      <components.Option
        {...rest}
        isMulti={isMulti}
        isDisabled={isDisabled}
        isFocused={isFocused}
        isSelected={isSelected}
        getStyles={getStyles}
        innerProps={innerProps}
      >
        {isMulti && (
          <Checkbox
            name={`${rest.label}`}
            checked={isSelected}
          />
        )}
        {!isMulti && (
          <Radio
            name={rest.selectProps.name}
            value={data.value}
            checked={isSelected}
            onClick={(event) => {
              const target = event.target as HTMLInputElement;
              rest.setValue(
                target.checked ? target.value : "",
                "select-option"
              );
            }}
            sx={{ color: "inherit !important" }}
          />
        )}
        {children}
      </components.Option>
    </Box>
  );
};

export default Option;
