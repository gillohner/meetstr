// src/components/common/events/DateTimeSection.tsx
import { LocalizationProvider } from "@mui/x-date-pickers";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { useTranslation } from "react-i18next";
import { Grid, InputAdornment, MenuItem, Paper, TextField } from "@mui/material";
import SectionHeader from "@/components/common/layout/SectionHeader";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PublicIcon from "@mui/icons-material/Public";

interface DateTimeSectionProps {
  timezone: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  onStartDateChange: (date: Dayjs | null) => void;
  onEndDateChange: (date: Dayjs | null) => void;
  onTimezoneChange: (tz: string) => void;
}

export const DateTimeSection = ({
  timezone,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onTimezoneChange,
}: DateTimeSectionProps) => {
  const { t } = useTranslation();

  return (
    <Paper elevation={0} sx={{ p: 2, bgcolor: "background.paper" }}>
      <SectionHeader title={t("event.createEvent.dateTime.title")} />
      <Grid container spacing={2} direction="row">
        <Grid item xs={12} md={4}>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={timezone}>
            <DateTimePicker
              label={t("event.createEvent.dateTime.start")}
              value={startDate}
              onChange={(date) => onStartDateChange(date)}
              slotProps={{
                textField: {
                  required: true,
                  fullWidth: true,
                  InputProps: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccessTimeIcon color="primary" />
                      </InputAdornment>
                    ),
                  },
                },
              }}
              ampm={false}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12} md={4}>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={timezone}>
            <DateTimePicker
              label={t("event.createEvent.dateTime.end")}
              value={endDate}
              onChange={(date) => onEndDateChange(date)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  InputProps: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccessTimeIcon color="primary" />
                      </InputAdornment>
                    ),
                  },
                },
              }}
              ampm={false}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            select
            fullWidth
            label={t("event.createEvent.form.timezone")}
            value={timezone}
            onChange={(e) => onTimezoneChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PublicIcon color="primary" />
                </InputAdornment>
              ),
            }}
          >
            {Intl.supportedValuesOf("timeZone").map((tz) => (
              <MenuItem key={tz} value={tz}>
                {tz}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default DateTimeSection;
