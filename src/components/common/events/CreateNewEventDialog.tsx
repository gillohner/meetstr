// src/components/common/events/CreateNewEventDialog.tsx
import * as React from "react";
import { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  Divider,
  Typography,
  useMediaQuery,
  useTheme,
  IconButton,
} from "@mui/material";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { useTranslation } from "react-i18next";
import { useNdk } from "nostr-hooks";
import { useActiveUser } from "@/hooks/useActiveUser";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import { nanoid } from "nanoid";
import { useSnackbar } from "@/context/SnackbarContext";
import ImageUploadWithPreview from "@/components/common/blossoms/ImageUploadWithPreview";
import FormTextField from "@/components/common/form/FormTextField";
import dynamic from "next/dynamic";
import DateTimeSection from "@/components/common/events/DateTimeSection";
import DialogActionsSection from "@/components/common/layout/DialogActionsSection";
import { encodeGeohash } from "@/utils/location/geohash";
import TagInputField from "@/components/common/form/TagInputField";
import NostrEntitySearchField, {
  type NostrReference,
} from "@/components/common/form/NostrEntitySearchField";
import { getEventMetadata } from "@/utils/nostr/eventUtils";
import { useRouter } from "next/navigation";

const FormGeoSearchField = dynamic(
  () => import("@/components/common/form/FormGeoSearchField"),
  { ssr: false }
);

import EventIcon from "@mui/icons-material/Event";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import DescriptionIcon from "@mui/icons-material/Description";
import CloseIcon from "@mui/icons-material/Close";

dayjs.extend(utc);
dayjs.extend(timezone);

interface CreateNewEventDialogProps {
  calendarEvent?: NDKEvent;
  initialEvent?: NDKEvent | null;
  onEventUpdated?: (event: NDKEvent) => void;
  open?: boolean;
  onClose?: () => void;
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

export default function CreateNewEventDialog({
  calendarEvent,
  initialEvent = null,
  onEventUpdated,
  open: controlledOpen,
  onClose: controlledOnClose,
}: CreateNewEventDialogProps) {
  const { t } = useTranslation();
  const { ndk } = useNdk();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [internalOpen, setInternalOpen] = useState(false);
  const [timezone, setTimezone] = useState(dayjs.tz.guess());
  const activeUser = useActiveUser();
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const [formValues, setFormValues] = useState({
    title: "",
    description: "",
    startDate: null as dayjs.Dayjs | null,
    endDate: null as dayjs.Dayjs | null,
  });
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [references, setReferences] = useState<string[]>([]);
  const [calendarRefs, setCalendarRefs] = useState<NostrReference[]>([]);
  const [location, setLocation] = useState<GeoSearchResult | null>(null);
  const [eventImage, setEventImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState<boolean>(false);
  const isEditMode = Boolean(initialEvent);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const onClose = controlledOnClose || (() => setInternalOpen(false));
  const isFormValid = Boolean(
    formValues.title.trim() &&
      formValues.description.trim() &&
      formValues.startDate &&
      location &&
      !imageLoading
  );

  // Pre-populate form when editing
  useEffect(() => {
    if (initialEvent) {
      const metadata = getEventMetadata(initialEvent);

      setFormValues({
        title: metadata.title || "",
        description: metadata.summary || "",
        startDate: metadata.start ? dayjs.unix(parseInt(metadata.start)) : null,
        endDate: metadata.end ? dayjs.unix(parseInt(metadata.end)) : null,
      });

      setHashtags(metadata.hashtags || []);
      setReferences(metadata.references || []);
      setEventImage(metadata.image || null);

      // Set up existing calendar references
      const existingCalendarRefs: NostrReference[] = initialEvent.tags
        .filter((tag) => tag[0] === "a" && tag[1].startsWith("31924:"))
        .map((tag) => ({
          aTag: tag[1],
          naddr: tag[1], // Use coordinate as display
          entity: null, // Don't fetch to avoid loading time
        }));
      setCalendarRefs(existingCalendarRefs);

      if (metadata.location) {
        setLocation({
          x: 0,
          y: 0,
          label: metadata.location,
          bounds: [
            [0, 0],
            [0, 0],
          ],
          raw: null,
        });
      }

      if (metadata.start_tzid) {
        setTimezone(metadata.start_tzid);
      }
    } else if (calendarEvent) {
      // Pre-populate with calendar reference when creating from calendar page
      const dTag = calendarEvent.tags.find((t) => t[0] === "d")?.[1];
      if (dTag) {
        const calendarRef: NostrReference = {
          aTag: `31924:${calendarEvent.pubkey}:${dTag}`,
          naddr: `31924:${calendarEvent.pubkey}:${dTag}`,
          entity: calendarEvent,
        };
        setCalendarRefs([calendarRef]);
      }
    }
  }, [initialEvent, calendarEvent]);

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
      let event: NDKEvent;
      let uniqueId: string;

      if (isEditMode && initialEvent) {
        event = new NDKEvent(ndk);
        event.kind = initialEvent.kind;
        event.content = formValues.description || "";
        uniqueId =
          initialEvent.tags.find((t) => t[0] === "d")?.[1] || nanoid(8);
        event.tags = [
          ["d", uniqueId],
          ["title", formValues.title],
        ];
      } else {
        uniqueId = nanoid(8);
        event = new NDKEvent(ndk);
        event.kind = 31923;
        event.content = formValues.description || "";
        event.tags = [
          ["d", uniqueId],
          ["title", formValues.title],
        ];
      }

      if (formValues.description) {
        event.tags.push(["summary", formValues.description]);
      }
      if (formValues.startDate) {
        event.tags.push([
          "start",
          Math.floor(formValues.startDate.unix()).toString(),
        ]);
      } else {
        throw new Error("Start date is required for time-based events");
      }
      if (formValues.endDate) {
        event.tags.push([
          "end",
          Math.floor(formValues.endDate.unix()).toString(),
        ]);
      }
      if (timezone) {
        event.tags.push(["start_tzid", timezone]);
        event.tags.push(["end_tzid", timezone]);
      }
      if (location) {
        event.tags.push(["location", location.label]);
      }
      if (location?.x && location?.y) {
        const geohash = encodeGeohash(location.y, location.x, 9);
        event.tags.push(["g", geohash]);
      }
      hashtags.forEach((tag) => event.tags.push(["t", tag]));
      references.forEach((ref) => event.tags.push(["r", ref]));
      if (eventImage) {
        event.tags.push(["image", eventImage]);
      }

      await handleCalendarReferences(event, uniqueId);

      // Redirect to the new event page if not edit mode
      if (!isEditMode && event.id) {
        router.push(`/event/${event.id}`);
      }

      if (isEditMode && onEventUpdated) {
        onEventUpdated(event);
      }
    } catch (error) {
      console.error("Error creating/updating event:", error);
      showSnackbar(t("event.createEvent.error"), "error");
    }
  };

  const handleCalendarReferences = async (
    event: NDKEvent,
    uniqueId: string
  ) => {
    if (!activeUser || !window.nostr) {
      throw new Error("No signer available");
    }

    const eventCoordinate = `31923:${activeUser?.pubkey}:${uniqueId}`;

    // Add all calendar references to event
    calendarRefs.forEach((ref) => {
      event.tags.push(["a", ref.aTag]);
    });

    // Sign and publish the event using window.nostr
    const unsignedEvent = {
      kind: event.kind,
      content: event.content,
      tags: event.tags,
      created_at: Math.floor(Date.now() / 1000),
      pubkey: activeUser.pubkey,
    };

    const signedEvent = await window.nostr.signEvent(unsignedEvent);
    const ndkEvent = new NDKEvent(ndk, signedEvent);
    await ndkEvent.publish();

    // Handle calendar updates for owned calendars
    if (!isEditMode) {
      for (const ref of calendarRefs) {
        if (ref.entity && ref.entity.pubkey === activeUser?.pubkey) {
          // User owns this calendar, update it to include the event
          try {
            const updatedCalendar = new NDKEvent(ndk);
            updatedCalendar.kind = 31924;
            updatedCalendar.tags = ref.entity.tags.filter(
              (tag: string[]) => !(tag[0] === "a" && tag[1] === eventCoordinate)
            );
            updatedCalendar.tags.push(["a", eventCoordinate]);
            updatedCalendar.content = ref.entity.content || "";

            // Sign and publish the calendar using window.nostr
            const unsignedCalendar = {
              kind: updatedCalendar.kind,
              content: updatedCalendar.content,
              tags: updatedCalendar.tags,
              created_at: Math.floor(Date.now() / 1000),
              pubkey: activeUser.pubkey,
            };

            const signedCalendar =
              await window.nostr.signEvent(unsignedCalendar);
            const ndkCalendar = new NDKEvent(ndk, signedCalendar);
            await ndkCalendar.publish();
          } catch (error) {
            console.error("Error updating owned calendar:", error);
          }
        }
      }
    }

    showSnackbar(
      isEditMode ? t("event.edit.success") : t("event.createEvent.success"),
      "success"
    );
    onClose();
  };

  React.useEffect(() => {
    console.log("activeUser in CreateNewEventDialog:", activeUser);
  }, [activeUser]);

  if (activeUser === undefined || activeUser === null) return null;

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle
          sx={{
            bgcolor: "background.default",
            color: "text.primary",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pr: 1,
          }}
        >
          <Typography variant="h5" component="div">
            <EventIcon
              sx={{ mr: 1, verticalAlign: "middle", color: "primary.main" }}
            />
            {isEditMode
              ? t("event.edit.title")
              : t("event.createEvent.newEvent")}
          </Typography>
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              color: "text.secondary",
              "&:hover": {
                color: "text.primary",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ bgcolor: "background.paper" }}>
          <form onSubmit={handleFormSubmit}>
            <Grid container spacing={2} direction="row" sx={{ marginTop: 1 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                {" "}
                <Grid container spacing={2} direction="column">
                  <Grid size={12}>
                    <FormTextField
                      label={t("event.createEvent.form.title")}
                      name="title"
                      value={formValues.title}
                      onChange={(e) =>
                        setFormValues((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      icon={<EventIcon color="primary" />}
                      required
                    />
                  </Grid>
                  <Grid size={12}>
                    <FormTextField
                      label={t("event.createEvent.form.description")}
                      name={t("event.createEvent.form.description")}
                      value={formValues.description}
                      onChange={(e) =>
                        setFormValues((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
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
                      icon={<LocationOnIcon />}
                      value={location}
                      onChange={handleLocationChange}
                      required={true}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid size={12}>
                <DateTimeSection
                  startDate={formValues.startDate}
                  endDate={formValues.endDate}
                  timezone={timezone}
                  onStartDateChange={(date) =>
                    setFormValues((prev) => ({ ...prev, startDate: date }))
                  }
                  onEndDateChange={(date) =>
                    setFormValues((prev) => ({ ...prev, endDate: date }))
                  }
                  onTimezoneChange={setTimezone}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TagInputField
                  label={t("event.createEvent.form.hashtags")}
                  values={hashtags}
                  onChange={setHashtags}
                  placeholder={t("event.createEvent.form.addHashtag")}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TagInputField
                  label={t("event.createEvent.form.references")}
                  values={references}
                  onChange={setReferences}
                  placeholder={t("event.createEvent.form.addReference")}
                />
              </Grid>

              <Grid size={12}>
                <NostrEntitySearchField
                  label={t(
                    "event.createEvent.form.calendars",
                    "Add to Calendars"
                  )}
                  value={calendarRefs}
                  onChange={setCalendarRefs}
                  placeholder={t(
                    "event.createEvent.form.addCalendar",
                    "Search calendars or paste naddr..."
                  )}
                  allowedKinds={[31924]}
                  showRemoveInPreview={true}
                  maxHeight={200}
                />
              </Grid>
            </Grid>
            <Divider sx={{ my: 3, borderColor: "divider" }} />
            <DialogActionsSection
              onCancel={onClose}
              disabled={!isFormValid}
              submitLabel={
                isEditMode
                  ? t("event.edit.submit")
                  : t("event.createEvent.submit")
              }
            />
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
