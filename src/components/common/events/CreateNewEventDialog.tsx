// src/components/common/events/CreateNewEventDialog.tsx
import * as React from "react";
import { useState } from "react";
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
import { Grid } from "@mui/material";
import { useTranslation } from "react-i18next";
import InputAdornment from "@mui/material/InputAdornment";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import { useBlossomUpload } from "@/hooks/useBlossomUpload";
import { useActiveUser } from "nostr-hooks";
import { useSnackbar } from "@/context/SnackbarContext";
import ImageUploadWithPreview from "@/components/common/blossoms/ImageUploadWithPreview";
import FormTextField from "@/components/common/form/FormTextField";
import DateTimeSection from "@/components/common/events/DateTimeSection";
import DialogActionsSection from "@/components/common/layout/DialogActionsSection";

// Import icons
import EventIcon from "@mui/icons-material/Event";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import DescriptionIcon from "@mui/icons-material/Description";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PublicIcon from "@mui/icons-material/Public";
import ImageIcon from "@mui/icons-material/Image";

dayjs.extend(utc);
dayjs.extend(timezone);

export default function CreateNewEventDialog() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [timezone, setTimezone] = useState(dayjs.tz.guess());
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const { activeUser } = useActiveUser();
  const [eventImage, setEventImage] = useState<string | null>(null);
  const { uploadFile } = useBlossomUpload();
  const { showSnackbar } = useSnackbar();

  const handleImageUploaded = (imageUrl: string) => {
    setEventImage(imageUrl);
    showSnackbar(t("event.createEvent.imageUpload.success"));
  };

  const handleImageRemoved = () => {
    setEventImage(null);
  };

  if (activeUser === undefined || activeUser === null) return "";

  return (
    <>
      <Button size="large" variant="contained" onClick={() => setOpen(true)} sx={{ width: "100%" }}>
        {t("event.createEvent.title")}
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: "background.default", color: "text.primary" }}>
          <Typography variant="h5" component="div">
            <EventIcon sx={{ mr: 1, verticalAlign: "middle", color: "primary.main" }} />
            {t("event.createEvent.newEvent")}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ bgcolor: "background.paper" }}>
          <form>
            <Grid container spacing={2} direction="row" sx={{ marginTop: 1 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                {" "}
                <Grid container spacing={2} direction="column">
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormTextField
                      label={t("event.createEvent.form.title")}
                      name="title"
                      icon={<EventIcon color="primary" />}
                      required
                    />
                  </Grid>
                  <Grid size={12}>
                    <FormTextField
                      label={t("event.createEvent.form.description")}
                      name="description"
                      icon={<DescriptionIcon color="primary" />}
                      multiline
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Grid container spacing={2.5} direction="column">
                  <Grid size={12}>
                    <ImageUploadWithPreview
                      initialPreview={eventImage || ""}
                      onImageUploaded={handleImageUploaded}
                      onImageRemoved={handleImageRemoved}
                      uploadFunction={uploadFile}
                    />
                  </Grid>
                  <Grid size={12}>
                    <FormTextField
                      label={t("event.createEvent.form.location")}
                      name="location"
                      icon={<LocationOnIcon color="primary" />}
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid size={12}>
                <DateTimeSection timezone={timezone} onTimezoneChange={setTimezone} />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3, borderColor: "divider" }} />

            <DialogActionsSection
              onCancel={() => setOpen(false)}
              submitLabel={t("event.createEvent.submit")}
            />
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
