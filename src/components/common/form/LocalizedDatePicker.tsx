// src/components/common/form/LocalizedDatePicker.tsx
import React from "react";
import { LocalizationProvider } from "@mui/x-date-pickers";
import type { DatePickerProps } from "@mui/x-date-pickers/DatePicker";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import type { DateTimePickerProps } from "@mui/x-date-pickers/DateTimePicker";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useClientLocale } from "@/hooks/useClientLocale";

interface LocalizedDatePickerProps
  extends Omit<DatePickerProps<any>, "format"> {
  format?: string;
}

interface LocalizedDateTimePickerProps
  extends Omit<DateTimePickerProps<any>, "format"> {
  format?: string;
}

export const LocalizedDatePicker: React.FC<LocalizedDatePickerProps> = ({
  format,
  ...props
}) => {
  const { locale, dateFormat, isClient } = useClientLocale();

  if (!isClient) {
    return null; // Don't render on server to prevent hydration mismatch
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={locale}>
      <DatePicker format={format || dateFormat} {...props} />
    </LocalizationProvider>
  );
};

export const LocalizedDateTimePicker: React.FC<
  LocalizedDateTimePickerProps
> = ({ format, ...props }) => {
  const { locale, dateTimeFormat, isClient } = useClientLocale();

  if (!isClient) {
    return null; // Don't render on server to prevent hydration mismatch
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={locale}>
      <DateTimePicker
        format={format || dateTimeFormat}
        ampm={false}
        {...props}
      />
    </LocalizationProvider>
  );
};

export default LocalizedDatePicker;
