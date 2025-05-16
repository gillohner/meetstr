// src/components/common/events/CreateNewEventDialog.tsx
import * as React from "react";
import { useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { Grid } from "@mui/material";
import { useTranslation } from "react-i18next";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import { useActiveUser } from "nostr-hooks";
import { useSnackbar } from "@/context/SnackbarContext";
import ImageUploadWithPreview from "@/components/common/blossoms/ImageUploadWithPreview";
import FormTextField from "@/components/common/form/FormTextField";
import dynamic from "next/dynamic";
import DateTimeSection from "@/components/common/events/DateTimeSection";
import DialogActionsSection from "@/components/common/layout/DialogActionsSection";
const FormGeoSearchField = dynamic(() => import("@/components/common/form/FormGeoSearchField"), {
  ssr: false,
});

// Import icons
import EventIcon from "@mui/icons-material/Event";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import DescriptionIcon from "@mui/icons-material/Description";

dayjs.extend(utc);
dayjs.extend(timezone);

// Define the GeoSearchResult interface for location data
interface GeoSearchResult {
  x: number; // longitude
  y: number; // latitude
  label: string; // formatted address
  bounds: [
    [number, number], // south, west - lat, lon
    [number, number], // north, east - lat, lon
  ];
  raw: any; // raw provider result
}

export default function CreateNewEventDialog() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [timezone, setTimezone] = useState(dayjs.tz.guess());
  const { activeUser } = useActiveUser();
  const { showSnackbar } = useSnackbar();
  const [formValues, setFormValues] = useState({
    title: "",
    description: "",
    startDate: null as dayjs.Dayjs | null,
    endDate: null as dayjs.Dayjs | null,
  });
  const [location, setLocation] = useState<GeoSearchResult | null>(null);
  const [eventImage, setEventImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState<boolean>(false);
  const isFormValid = Boolean(
    formValues.title.trim() &&
      formValues.description.trim() &&
      formValues.startDate &&
      location &&
      !imageLoading
  );

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const handleImageUploaded = (imageUrl: string) => {
    setEventImage(imageUrl);
  };

  const handleImageRemoved = () => {
    setEventImage(null);
  };

  const handleLocationChange = (newLocation: GeoSearchResult | null) => {
    setLocation(newLocation);
  };

  const onSubmit = async function () {
    if (!activeUser) return;

    try {
      console.log("Form Values:", {
        ...formValues,
        location,
        eventImage,
        timezone,
      });

      showSnackbar(t("event.createEvent.success"), "success");
    } catch (error) {
      console.error("Error creating event:", error);
      showSnackbar(t("event.createEvent.error"), "error");
    } finally {
      // setOpen(false);
    }
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
          <form onSubmit={handleFormSubmit}>
            <Grid container spacing={2} direction="row" sx={{ marginTop: 1 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                {" "}
                <Grid container spacing={2} direction="column">
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormTextField
                      label={t("event.createEvent.form.title")}
                      name="title"
                      value={formValues.title}
                      onChange={(e) =>
                        setFormValues((prev) => ({ ...prev, title: e.target.value }))
                      }
                      icon={<EventIcon color="primary" />}
                      required
                    />
                  </Grid>
                  <Grid size={12}>
                    <FormTextField
                      label={t("event.createEvent.form.description")}
                      name="description"
                      value={formValues.description}
                      onChange={(e) =>
                        setFormValues((prev) => ({ ...prev, description: e.target.value }))
                      }
                      icon={<DescriptionIcon color="primary" />}
                      multiline
                      required
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
                      showControls={true}
                      loading={imageLoading}
                      setLoading={setImageLoading}
                    />
                  </Grid>
                  <Grid size={12}>
                    <FormGeoSearchField
                      label={t("event.createEvent.form.location")}
                      name="location"
                      icon={<LocationOnIcon color="primary" />}
                      value={location}
                      onChange={handleLocationChange}
                      required={true}
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid size={12}>
                <DateTimeSection
                  timezone={timezone}
                  startDate={formValues.startDate}
                  endDate={formValues.endDate}
                  onStartDateChange={(date) =>
                    setFormValues((prev) => ({ ...prev, startDate: date }))
                  }
                  onEndDateChange={(date) => setFormValues((prev) => ({ ...prev, endDate: date }))}
                  onTimezoneChange={setTimezone}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3, borderColor: "divider" }} />

            <DialogActionsSection
              submitLabel={t("event.createEvent.submit")}
              disabled={!isFormValid}
              onCancel={() => setOpen(false)}
            />
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
