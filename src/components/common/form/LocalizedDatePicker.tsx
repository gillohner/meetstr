// src/components/common/form/LocalizedDatePicker.tsx
import React, { useState, useEffect } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { DatePicker, DatePickerProps } from "@mui/x-date-pickers/DatePicker";
import {
  DateTimePicker,
  DateTimePickerProps,
} from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { getDayjsLocale } from "@/utils/formatting/dayjsConfig";
import {
  getDatePickerFormat,
  getDateTimePickerFormat,
} from "@/utils/formatting/datePickerConfig";

interface LocalizedDatePickerProps
  extends Omit<DatePickerProps<any>, "format"> {
  format?: string;
}

interface LocalizedDateTimePickerProps
  extends Omit<DateTimePickerProps<any>, "format"> {
  format?: string;
}

export const LocalizedDatePicker: React.FC<LocalizedDatePickerProps> = ({
  format = getDatePickerFormat(),
  ...props
}) => {
  const [isClient, setIsClient] = useState(false);
  const [dayjsLocale, setDayjsLocale] = useState("de");
  const [clientFormat, setClientFormat] = useState("DD.MM.YYYY");

  useEffect(() => {
    setIsClient(true);
    const locale = getDayjsLocale();
    setDayjsLocale(locale);
    
    // Update format based on actual browser locale
    const formatToUse = getDatePickerFormat();
    setClientFormat(formatToUse);
    
    // Configure dayjs with user locale
    dayjs.locale(locale);
  }, []);

  if (!isClient) {
    return null; // Don't render on server to prevent hydration mismatch
  }

  return (
    <LocalizationProvider
      dateAdapter={AdapterDayjs}
      adapterLocale={dayjsLocale}
    >
      <DatePicker format={clientFormat} {...props} />
    </LocalizationProvider>
  );
};

export const LocalizedDateTimePicker: React.FC<
  LocalizedDateTimePickerProps
> = ({ format = getDateTimePickerFormat(), ...props }) => {
  const [isClient, setIsClient] = useState(false);
  const [dayjsLocale, setDayjsLocale] = useState("de");
  const [clientFormat, setClientFormat] = useState("DD.MM.YYYY HH:mm");

  useEffect(() => {
    setIsClient(true);
    const locale = getDayjsLocale();
    setDayjsLocale(locale);
    
    // Update format based on actual browser locale
    const formatToUse = getDateTimePickerFormat();
    setClientFormat(formatToUse);
    
    // Configure dayjs with user locale
    dayjs.locale(locale);
  }, []);

  if (!isClient) {
    return null; // Don't render on server to prevent hydration mismatch
  }

  return (
    <LocalizationProvider
      dateAdapter={AdapterDayjs}
      adapterLocale={dayjsLocale}
    >
      <DateTimePicker format={clientFormat} ampm={false} {...props} />
    </LocalizationProvider>
  );
};

export default LocalizedDatePicker;
