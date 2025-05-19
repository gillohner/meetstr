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
import { useNdk, useActiveUser } from "nostr-hooks";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import { nanoid } from "nanoid";
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

interface CreateNewEventDialogProps {
  calendarEvent?: NDKEvent;
}

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

export default function CreateNewEventDialog({ calendarEvent }: CreateNewEventDialogProps) {
  const { t } = useTranslation();
  const { ndk } = useNdk();
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
    if (!activeUser || !ndk) return;

    try {
      // Generate a unique identifier for the event
      const uniqueId = nanoid(8);

      // Create a new event
      const event = new NDKEvent(ndk);
      event.kind = 31923; // Time-Based Calendar Event
      event.content = formValues.description || ""; // Required by NIP-52 update

      // Add required tags
      event.tags = [
        ["d", uniqueId],
        ["title", formValues.title],
      ];

      // Add summary if available
      if (formValues.description) {
        event.tags.push(["summary", formValues.description]);
      }

      // Add start and end times
      if (formValues.startDate) {
        event.tags.push(["start", Math.floor(formValues.startDate.unix()).toString()]);
      } else {
        throw new Error("Start date is required for time-based events");
      }

      if (formValues.endDate) {
        event.tags.push(["end", Math.floor(formValues.endDate.unix()).toString()]);
      }

      // Add timezone information
      if (timezone) {
        event.tags.push(["start_tzid", timezone]);
        event.tags.push(["end_tzid", timezone]);
      }

      // Add location information
      if (location) {
        event.tags.push(["location", location.label]);

        // If we have coordinates, include them
        if (location.y && location.x) {
          // TODO: In a real implementation, add geohash
          console.log("Location coordinates:", { lat: location.y, lng: location.x });
        }
      }

      // Add image if available
      if (eventImage) {
        event.tags.push(["image", eventImage]);
      }

      // Process the rest based on calendar ownership
      handleCalendarReferences(event, uniqueId);
    } catch (error) {
      console.error("Error creating event:", error);
      showSnackbar(t("event.createEvent.error"), "error");
    }
  };

  const handleCalendarReferences = async (event: NDKEvent, uniqueId: string) => {
    // Get the calendar's d tag if available
    const calendarDTag = calendarEvent?.tags.find((t) => t[0] === "d")?.[1];

    // Check if we're in a calendar context and if the user is the owner
    const isCalendarOwner = calendarEvent && calendarEvent.pubkey === activeUser?.pubkey;

    // The event reference coordinate
    const eventCoordinate = `31923:${activeUser?.pubkey}:${uniqueId}`;

    console.log("isCalendarOwner:", isCalendarOwner);
    console.log("calendarEvent:", calendarEvent);
    console.log("calendarDTag:", calendarDTag);
    console.log("eventCoordinate:", eventCoordinate);
    console.log("activeUser:", activeUser);

    if (isCalendarOwner && calendarEvent && calendarDTag) {
      // Add the calendar reference to the event
      event.tags.push(["a", `31924:${calendarEvent.pubkey}:${calendarDTag}`]);

      // Sign and publish the event
      await event.sign();
      await event.publish();

      // Log the created event
      console.log("Created event:", JSON.stringify(event, null, 2));

      // Now update the calendar to include the new event
      const updatedCalendar = new NDKEvent(ndk);
      updatedCalendar.kind = 31924; // Calendar

      // Copy existing tags but avoid duplicates
      updatedCalendar.tags = calendarEvent.tags.filter(
        (tag) => !(tag[0] === "a" && tag[1] === eventCoordinate)
      );

      // Add the new event reference to the calendar
      updatedCalendar.tags.push(["a", eventCoordinate]);

      // Ensure the calendar has content (required by May 19, 2025 update)
      updatedCalendar.content = calendarEvent.content || "";

      // Sign and publish the updated calendar
      await updatedCalendar.sign();
      await updatedCalendar.publish();

      // Log the updated calendar
      console.log("Updated calendar:", JSON.stringify(updatedCalendar, null, 2));
    } else {
      // We're not the calendar owner, just create the event with a reference to the calendar
      if (calendarEvent && calendarDTag) {
        event.tags.push(["a", `31924:${calendarEvent.pubkey}:${calendarDTag}`]);
      }

      // Sign and publish the event
      await event.sign();
      await event.publish();

      // Log the created event
      console.log("Created event (approval needed):", JSON.stringify(event, null, 2));
    }

    showSnackbar(t("event.createEvent.success"), "success");
    setOpen(false);
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
