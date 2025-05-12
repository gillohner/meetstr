// src/components/common/events/DateTimeSection.tsx
import { LocalizationProvider } from "@mui/x-date-pickers";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { Grid, InputAdornment, MenuItem, Paper, TextField } from "@mui/material";
import SectionHeader from "@/components/common/layout/SectionHeader";

// import Icons
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PublicIcon from "@mui/icons-material/Public";

export const DateTimeSection = ({
  timezone,
  onTimezoneChange,
}: {
  timezone: string;
  onTimezoneChange: (tz: string) => void;
}) => {
  const { t } = useTranslation();

  return (
    <Paper elevation={0} sx={{ p: 2, bgcolor: "background.paper" }}>
      <SectionHeader title={t("event.createEvent.dateTime.title")} />
      <Grid container spacing={2} direction="row">
        <Grid size={{ xs: 12, md: 4 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={timezone}>
            <DateTimePicker
              label={t("event.createEvent.dateTime.start")}
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
            />
          </LocalizationProvider>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={timezone}>
            <DateTimePicker
              label={t("event.createEvent.dateTime.end")}
              slotProps={{
                textField: {
                  fullWidth: true,
                  InputProps: {
                    startAdornment: (
                      <InputAdornment position="end">
                        <AccessTimeIcon color="primary" />
                      </InputAdornment>
                    ),
                  },
                },
              }}
            />
          </LocalizationProvider>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
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
