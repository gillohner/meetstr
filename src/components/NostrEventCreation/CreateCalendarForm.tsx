// src/components/NostrEventCreation/CreateCalendarForm.tsx
import { useState, useCallback } from "react";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import { useNdk } from "nostr-hooks";
import { useActiveUser } from "@/hooks/useActiveUser";
import { Typography, Grid, Divider, Box, Paper } from "@mui/material";
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

// Icons
import EventIcon from "@mui/icons-material/Event";
import DescriptionIcon from "@mui/icons-material/Description";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

export default function CreateCalendarForm() {
  const { t } = useTranslation();
  const { ndk } = useNdk();
  const activeUser = useActiveUser();
  const { showSnackbar } = useSnackbar();
  const router = useRouter();

  const [formValues, setFormValues] = useState({
    title: "",
    description: "",
  });

  const [calendarRefs, setCalendarRefs] = useState<EventReference[]>([]);
  const [calendarImage, setCalendarImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const isFormValid = Boolean(
    formValues.title.trim() &&
      formValues.description.trim() &&
      !imageLoading &&
      !isSubmitting
  );

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
      const uniqueId = nanoid(8);

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

      showSnackbar(t("createCalendar.success"), "success");

      // Redirect to the new calendar page using the NDK event's id
      if (ndkEvent.id) {
        router.push(`/calendar/${ndkEvent.id}`);
      }

      // Reset form fields
      setFormValues({
        title: "",
        description: "",
      });
      setCalendarImage(null);
      setCalendarRefs([]);
    } catch (error) {
      console.error("Error creating calendar:", error);
      showSnackbar(t("createCalendar.error"), "error");
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
  ]);

  if (activeUser === undefined || activeUser === null) return null;

  return (
    <Paper elevation={1} sx={{ p: 3, maxWidth: 900, minWidth: 600, mt: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h5"
          component="div"
          sx={{ display: "flex", alignItems: "center", mb: 2 }}
        >
          <CalendarMonthIcon
            sx={{ mr: 1, verticalAlign: "middle", color: "primary.main" }}
          />
          {t("createCalendar.title")}
        </Typography>
      </Box>

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
          onCancel={() => {
            // Reset form
            setFormValues({
              title: "",
              description: "",
            });
            setCalendarImage(null);
            setCalendarRefs([]);
          }}
          disabled={!isFormValid}
          submitLabel={t("createCalendar.submit")}
        />
      </form>
    </Paper>
  );
}
