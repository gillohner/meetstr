import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import Grid from "@mui/material/Grid";
import { useTranslation } from "react-i18next";
import InputAdornment from "@mui/material/InputAdornment";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";

// Import icons
import EventIcon from "@mui/icons-material/Event";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import DescriptionIcon from "@mui/icons-material/Description";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PublicIcon from "@mui/icons-material/Public";
import ImageIcon from "@mui/icons-material/Image";

dayjs.extend(utc);
dayjs.extend(timezone);

export default function EventDialogTemplate() {
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);
  const [timezone, setTimezone] = React.useState(dayjs.tz.guess());
  const [preview, setPreview] = React.useState("");

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result);
      reader.readAsDataURL(file);
    }
  };
  return (
    <>
      <Button variant="outlined" onClick={() => setOpen(true)}>
        Create Event
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: "background.default", color: "text.primary" }}>
          <Typography variant="h5" component="div">
            <EventIcon sx={{ mr: 1, verticalAlign: "middle", color: "primary.main" }} />
            New Event Details
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ bgcolor: "background.paper" }}>
          <form>
            <Grid container spacing={2} direction="row" sx={{ marginTop: 1 }}>
              {/* Left Column */}
              <Grid size={{ xs: 12, md: 6 }}>
                {" "}
                <Grid container spacing={2} direction="column">
                  {/* Title */}
                  <Grid size={12}>
                    <TextField
                      fullWidth
                      label="Event Title"
                      name="title"
                      required
                      sx={{
                        "& .MuiInputBase-root": { bgcolor: "background.paper" },
                        "& .MuiInputLabel-root": { color: "text.primary" },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EventIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  {/* Description */}
                  <Grid item size={12}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={4}
                      label="Description"
                      name="description"
                      sx={{
                        "& .MuiInputBase-root": { bgcolor: "background.paper" },
                        "& .MuiInputLabel-root": { color: "text.primary" },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <DescriptionIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* Right Column */}
              <Grid size={{ xs: 12, md: 6 }}>
                {" "}
                <Grid container spacing={2.5} direction="column">
                  {/* Image Upload */}
                  <Grid item>
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <Button
                        component="label"
                        variant="outlined"
                        fullWidth
                        startIcon={<ImageIcon color="primary" />}
                        sx={{ mb: 2, color: "primary.main", borderColor: "primary.main" }}
                      >
                        Upload Image
                        <input type="file" accept="image/*" hidden onChange={handleFileChange} />
                      </Button>
                      {preview && (
                        <Paper
                          elevation={2}
                          sx={{ p: 1, width: "100%", bgcolor: "background.default" }}
                        >
                          <img
                            src={preview}
                            alt="Event preview"
                            style={{ width: "100%", height: "auto", borderRadius: "4px" }}
                          />
                        </Paper>
                      )}
                    </Box>
                  </Grid>

                  {/* Location */}
                  <Grid item>
                    <TextField
                      fullWidth
                      label="Location"
                      name="location"
                      autoComplete="off"
                      sx={{
                        "& .MuiInputBase-root": { bgcolor: "background.paper" },
                        "& .MuiInputLabel-root": { color: "text.primary" },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocationOnIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* Date/Time Section */}
              <Grid size={12}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: "black" }}>
                  <Typography variant="subtitle1" gutterBottom color="text.primary">
                    Date and Time
                  </Typography>
                  <Grid container spacing={2} direction="row">
                    <Grid size={{ xs: 12, md: 4 }}>
                      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={timezone}>
                        <DateTimePicker
                          label="Start Time"
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              sx: {
                                "& .MuiInputBase-root": { bgcolor: "background.paper" },
                                "& .MuiInputLabel-root": { color: "text.primary" },
                              },
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
                          label="End Time"
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              sx: {
                                "& .MuiInputBase-root": { bgcolor: "background.paper" },
                                "& .MuiInputLabel-root": { color: "text.primary" },
                              },
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
                      <TextField
                        select
                        fullWidth
                        label={t("event.createEvent.form.timezone")}
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        sx={{
                          "& .MuiInputBase-root": { bgcolor: "background.paper" },
                          "& .MuiInputLabel-root": { color: "text.primary" },
                        }}
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
              </Grid>
            </Grid>

            <Divider sx={{ my: 3, borderColor: "divider" }} />

            <DialogActions sx={{ bgcolor: "background.default" }}>
              <Button onClick={() => setOpen(false)} sx={{ color: "text.primary" }}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" color="primary">
                Create
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
