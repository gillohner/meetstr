// src/components/NostrEventCreation/CreateCalendarForm.tsx
import * as React from "react";
import { useState, useCallback, useEffect } from "react";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import { useNdk } from "nostr-hooks";
import { useActiveUser } from "@/hooks/useActiveUser";
import {
  Typography,
  Grid,
  Divider,
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  useMediaQuery,
  useTheme,
  IconButton,
  Button,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { nanoid } from "nanoid";
import { useSnackbar } from "@/context/SnackbarContext";
import ImageUploadWithPreview from "@/components/common/blossoms/ImageUploadWithPreview";
import FormTextField from "@/components/common/form/FormTextField";
import DialogActionsSection from "@/components/common/layout/DialogActionsSection";
import EventReferencesField, {
  type EventReference,
} from "@/components/common/form/EventReferencesField";
import { useRouter } from "next/navigation";
import { getEventMetadata } from "@/utils/nostr/eventUtils";

// Icons
import EventIcon from "@mui/icons-material/Event";
import DescriptionIcon from "@mui/icons-material/Description";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CloseIcon from "@mui/icons-material/Close";

interface CreateCalendarFormProps {
  initialCalendar?: NDKEvent | null;
  onCalendarUpdated?: (calendar: NDKEvent) => void;
  open?: boolean;
  onClose?: () => void;
}

export default function CreateCalendarForm({
  initialCalendar = null,
  onCalendarUpdated,
  open: controlledOpen,
  onClose: controlledOnClose,
}: CreateCalendarFormProps) {
  const { t } = useTranslation();
  const { ndk } = useNdk();
  const activeUser = useActiveUser();
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [internalOpen, setInternalOpen] = useState(false);

  const [formValues, setFormValues] = useState({
    title: "",
    description: "",
  });

  const [calendarRefs, setCalendarRefs] = useState<EventReference[]>([]);
  const [calendarImage, setCalendarImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const isEditMode = Boolean(initialCalendar);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const onClose = controlledOnClose || (() => setInternalOpen(false));

  const isFormValid = Boolean(
    formValues.title.trim() &&
      formValues.description.trim() &&
      !imageLoading &&
      !isSubmitting
  );

  // Pre-populate form when editing
  useEffect(() => {
    if (initialCalendar) {
      const metadata = getEventMetadata(initialCalendar);

      setFormValues({
        title: metadata.title || "",
        description: metadata.summary || "",
      });

      setCalendarImage(metadata.image || null);

      // Convert existing 'a' tags to EventReference format (without fetching)
      const existingRefs: EventReference[] = initialCalendar.tags
        .filter((tag) => tag[0] === "a")
        .map((tag) => {
          const aTag = tag[1];
          const [kind, pubkey, dTag] = aTag.split(":");

          return {
            aTag,
            naddr: aTag, // Use the coordinate as display text
            event: null, // Don't fetch existing events to avoid network overhead
          };
        });

      setCalendarRefs(existingRefs);
    }
  }, [initialCalendar, ndk]);

  const handleImageUploaded = (imageUrl: string) => {
    setCalendarImage(imageUrl);
  };

  const handleImageRemoved = () => {
    setCalendarImage(null);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const onSubmit = useCallback(async () => {
    if (!activeUser || !ndk || !isFormValid || !window.nostr) return;

    setIsSubmitting(true);

    try {
      let uniqueId: string;

      if (isEditMode && initialCalendar) {
        uniqueId =
          initialCalendar.tags.find((t) => t[0] === "d")?.[1] || nanoid(8);
      } else {
        uniqueId = nanoid(8);
      }

      // Create event structure
      const eventData = {
        kind: 31924,
        content: formValues.description,
        tags: [
          ["d", uniqueId],
          ["title", formValues.title],
        ] as string[][],
        created_at: Math.floor(Date.now() / 1000),
        pubkey: activeUser.pubkey,
      };

      // Add description as summary tag per NIP-52
      if (formValues.description) {
        eventData.tags.push(["summary", formValues.description]);
      }

      // Add image URL if provided
      if (calendarImage) {
        eventData.tags.push(["image", calendarImage]);
      }

      // Add calendar references as "a" tags (only 31922/31923)
      calendarRefs.forEach((ref) => {
        eventData.tags.push(["a", ref.aTag]);
      });

      // Sign with window.nostr
      const signedEvent = await window.nostr.signEvent(eventData);

      // Convert to NDKEvent for publishing
      const ndkEvent = new NDKEvent(ndk, signedEvent);
      await ndkEvent.publish();

      showSnackbar(
        isEditMode ? t("calendar.edit.success") : t("createCalendar.success"),
        "success"
      );

      // Handle post-submit actions
      if (isEditMode && onCalendarUpdated) {
        onCalendarUpdated(ndkEvent);
      } else if (!isEditMode && ndkEvent.id) {
        // Redirect to the new calendar page
        router.push(`/calendar/${ndkEvent.id}`);
      }

      onClose();

      // Reset form fields if not editing
      if (!isEditMode) {
        setFormValues({
          title: "",
          description: "",
        });
        setCalendarImage(null);
        setCalendarRefs([]);
      }
    } catch (error) {
      console.error("Error creating/updating calendar:", error);
      showSnackbar(
        isEditMode ? t("calendar.edit.error") : t("createCalendar.error"),
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [
    activeUser,
    ndk,
    formValues,
    calendarImage,
    calendarRefs,
    isFormValid,
    showSnackbar,
    t,
    router,
    isEditMode,
    initialCalendar,
    onCalendarUpdated,
    onClose,
  ]);

  if (activeUser === undefined || activeUser === null) return null;

  return (
    <>
      {!controlledOpen && !isEditMode && (
        <Button
          size="large"
          variant="contained"
          onClick={() => setInternalOpen(true)}
          sx={{ width: "100%" }}
        >
          {t("createCalendar.title")}
        </Button>
      )}
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
            <CalendarMonthIcon
              sx={{ mr: 1, verticalAlign: "middle", color: "primary.main" }}
            />
            {isEditMode ? t("calendar.edit.title") : t("createCalendar.title")}
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
                <Grid container spacing={2} direction="column">
                  <Grid size={12}>
                    <FormTextField
                      label={t("createCalendar.form.title")}
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
                      label={t("createCalendar.form.description")}
                      name="description"
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
                      initialPreview={calendarImage || ""}
                      onImageUploaded={handleImageUploaded}
                      onImageRemoved={handleImageRemoved}
                      showControls={true}
                      loading={imageLoading}
                      setLoading={setImageLoading}
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid size={12}>
                <EventReferencesField
                  label={t("createCalendar.form.calendarReferences")}
                  value={calendarRefs}
                  onChange={setCalendarRefs}
                  placeholder={t(
                    "createCalendar.form.addReferenceNaddr",
                    "Paste event naddr or meetstr URL"
                  )}
                  allowedKinds={[31922, 31923]}
                  showRemoveInPreview={true}
                  maxHeight={350}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3, borderColor: "divider" }} />

            <DialogActionsSection
              onCancel={onClose}
              disabled={!isFormValid}
              submitLabel={
                isEditMode
                  ? t("calendar.edit.submit")
                  : t("createCalendar.submit")
              }
            />
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
