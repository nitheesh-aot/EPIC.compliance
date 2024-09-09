import React, { useState, forwardRef } from "react";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { PickersDay, PickersDayProps } from "@mui/x-date-pickers/PickersDay";
import { TextField, Popover, TextFieldProps } from "@mui/material";
import { Dayjs } from "dayjs";
import { BCDesignTokens } from "epic.theme";
import { DATE_FORMAT } from "@/utils/constants";

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
    const [selectingStartDate, setSelectingStartDate] = useState(true); // State to toggle between start and end date selection

    const handleInputClick = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
      setOpen(true); // Open the Popover on input click
    };

    const handleClickAway = () => {
      setOpen(false);
    };

    const handleDateChange = (date: Dayjs | null) => {
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
    };

    const renderCustomDay = (
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

      let style = {};

      if (isStart || isEnd) {
        style = {
          backgroundColor: BCDesignTokens.surfaceColorBackgroundDarkBlue,
          color: BCDesignTokens.typographyColorPrimaryInvert,
        };
      } else if (isInRange) {
        style = {
          backgroundColor: BCDesignTokens.themeBlue20,
          color: BCDesignTokens.typographyColorPrimary,
        };
      }
      return <PickersDay {...pickersDayProps} sx={style} />;
    };

    const renderInputText = () => {
      if (value.startDate && value.endDate) {
        return `${value.startDate.format(DATE_FORMAT)} — ${value.endDate.format(DATE_FORMAT)}`;
      }
      if (value.startDate) {
        return `${value.startDate.format(DATE_FORMAT)} - `;
      }
      return "";
    };

    return (
      <>
        <TextField
          {...otherProps}
          value={renderInputText()}
          onClick={handleInputClick}
          placeholder={otherProps.placeholder}
          fullWidth
          InputProps={{
            readOnly: true,
          }}
          error={otherProps.error}
          helperText={otherProps.helperText}
          InputLabelProps={{
            shrink: true, // for always display the placeholder
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
