import React, { useState, forwardRef, useCallback, useMemo } from "react";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { PickersDay, PickersDayProps } from "@mui/x-date-pickers/PickersDay";
import {
  TextField,
  Popover,
  TextFieldProps,
  InputAdornment,
} from "@mui/material";
import { Dayjs } from "dayjs";
import { BCDesignTokens } from "epic.theme";
import { DATE_FORMAT } from "@/utils/constants";
import { DateRangeRounded } from "@mui/icons-material";

export interface DateRange {
  startDate: Dayjs | null;
  endDate: Dayjs | null;
}

type DateRangePickerProps = {
  value: DateRange;
  onDateChange: (value: DateRange) => void;
} & TextFieldProps;

const DateRangePicker = forwardRef<HTMLDivElement, DateRangePickerProps>(
  ({ value, onDateChange, ...otherProps }, ref) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [open, setOpen] = useState(false);
    const [selectingStartDate, setSelectingStartDate] = useState(true);

    const handleInputClick = useCallback(
      (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
        setOpen(true);
      },
      []
    );

    const handleClickAway = useCallback(() => {
      setOpen(false);
    }, []);

    const handleDateChange = useCallback(
      (date: Dayjs | null) => {
        if (selectingStartDate) {
          onDateChange({ startDate: date, endDate: null });
          setSelectingStartDate(false);
        } else {
          if (date && value.startDate && date.isBefore(value.startDate)) {
            onDateChange({ startDate: date, endDate: null });
          } else {
            onDateChange({ ...value, endDate: date });
            setOpen(false);
          }
          setSelectingStartDate(true);
        }
      },
      [selectingStartDate, onDateChange, value]
    );

    const renderCustomDay = useCallback(
      (
        date: Dayjs,
        _selectedDates: Array<Dayjs | null>,
        pickersDayProps: PickersDayProps<Dayjs>
      ) => {
        const isStart = value.startDate && date.isSame(value.startDate, "day");
        const isEnd = value.endDate && date.isSame(value.endDate, "day");
        const isInRange =
          value.startDate &&
          value.endDate &&
          date.isAfter(value.startDate, "day") &&
          date.isBefore(value.endDate, "day");

        const style = {
          ...(isStart || isEnd
            ? {
                backgroundColor: BCDesignTokens.surfaceColorBackgroundDarkBlue,
                color: BCDesignTokens.typographyColorPrimaryInvert,
              }
            : isInRange
              ? {
                  backgroundColor: BCDesignTokens.themeBlue20,
                  color: BCDesignTokens.typographyColorPrimary,
                }
              : {}),
        };

        return <PickersDay {...pickersDayProps} sx={style} />;
      },
      [value]
    );

    const renderInputText = useMemo(() => {
      if (value.startDate && value.endDate) {
        return `${value.startDate.format(DATE_FORMAT)} — ${value.endDate.format(DATE_FORMAT)}`;
      }
      if (value.startDate) {
        return `${value.startDate.format(DATE_FORMAT)} -`;
      }
      return "";
    }, [value]);

    return (
      <>
        <TextField
          {...otherProps}
          value={renderInputText}
          onClick={handleInputClick}
          placeholder={otherProps.placeholder}
          fullWidth
          InputProps={{
            readOnly: true,
            endAdornment: (
              <InputAdornment position="end" sx={{ mr: "-0.25rem" }}>
                <DateRangeRounded />
              </InputAdornment>
            ),
          }}
          error={otherProps.error}
          helperText={otherProps.helperText}
          InputLabelProps={{
            shrink: true,
          }}
        />
        <Popover
          ref={ref}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClickAway}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
        >
          <DateCalendar
            value={selectingStartDate ? value.startDate : value.endDate}
            onChange={handleDateChange}
            renderLoading={() => <div>Loading...</div>}
            slots={{
              day: (props) => renderCustomDay(props.day, [], props),
            }}
          />
        </Popover>
      </>
    );
  }
);

export default DateRangePicker;
