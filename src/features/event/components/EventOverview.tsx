import * as React from "react";
import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Container,
  Box,
  Chip,
  Divider,
  Grid,
  Link,
  CircularProgress,
} from "@mui/material";
import { getEventMetadata } from "@/utils/nostr/eventUtils";
import EventLocationText from "@/components/common/events/EventLocationText";
import EventTimeDisplay from "@/components/common/events/EventTimeDisplay";
import { useNostrEvent } from "@/hooks/useNostrEvent";
import EventLocationMapCard from "@/components/common/events/EventLocationMapCard";
import EventRsvpMenu from "@/components/common/events/EventRsvpMenu";
import EventAttendeesCard from "@/components/common/events/EventAttendeesCard";
import EventCommentsCard from "@/components/common/events/EventCommentsCard";
import EventHost from "@/components/common/events/EventHost";
import { useNostrUrlUpdate } from "@/hooks/useNostrUrlUpdate";
import { useActiveUser } from "nostr-hooks";
import { useSnackbar } from "@/context/SnackbarContext";
import CreateNewEventDialog from "@/components/common/events/CreateNewEventDialog";
import EventActionsMenu from "@/components/common/events/EventActionsMenu";

export default function EventOverview({ eventId }: { eventId?: string }) {
  const { t } = useTranslation();
  const { event, loading, errorCode, fetchEvent, removeEvent } =
    useNostrEvent();
  const { updateUrlWithNip19 } = useNostrUrlUpdate();
  const { activeUser } = useActiveUser();
  const { showSnackbar } = useSnackbar();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const expectedKinds = useMemo(() => [31922, 31923], []);

  useEffect(() => {
    if (eventId) {
      fetchEvent(eventId, expectedKinds);
    }
  }, [eventId, fetchEvent, expectedKinds]);

  useEffect(() => {
    if (event) {
      updateUrlWithNip19(event);
    }
  }, [event, updateUrlWithNip19]);

  const isOwner = activeUser && event && activeUser.pubkey === event.pubkey;

  const handleEdit = () => {
    setEditDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!event || !isOwner) return;

    if (window.confirm(t("event.delete.confirm"))) {
      try {
        await removeEvent(event, t("event.delete.reason"));
        showSnackbar(t("event.delete.success"), "success");
        window.history.back();
      } catch (error) {
        console.error("Error deleting event:", error);
        showSnackbar(t("event.delete.error"), "error");
      }
    }
  };

  const handleEventUpdated = (updatedEvent: any) => {
    showSnackbar(t("event.edit.success"), "success");
    setEditDialogOpen(false);
    fetchEvent(updatedEvent.id, expectedKinds);
  };

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
        <CircularProgress />
      </Box>
    );
  if (errorCode) return <Typography>{errorCode}</Typography>;

  if (!event || !eventId) {
    return <Typography>{t("error.event.invalidId")}</Typography>;
  }

  const metadata = getEventMetadata(event);

  return (
    <Container maxWidth="lg" sx={{ mb: 4 }}>
      <Card sx={{ width: "100%", mb: 4, position: "relative" }}>
        {/* EventActionsMenu positioned in top-right corner */}
        {isOwner && (
          <EventActionsMenu
            onEdit={handleEdit}
            onDelete={handleDelete}
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              zIndex: 1,
            }}
          />
        )}

        {metadata.image ? (
          <CardMedia
            component="img"
            alt={metadata.title || ""}
            height="300"
            image={metadata.image}
            sx={{ objectFit: "cover" }}
          />
        ) : (
          <Box
            sx={{
              height: 75,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: (theme) => theme.palette.secondary.main,
            }}
          />
        )}
        <CardContent>
          <Grid container>
            <Grid
              size={10}
              sx={{ pr: isOwner ? 6 : 0 }} // Add padding to prevent content overlap with menu
            >
              <Typography gutterBottom variant="h4" component="div">
                {metadata.title || t("error.event.noName", "Unnamed Event")}
              </Typography>
              <EventHost hostPubkey={event.pubkey} />
              <EventTimeDisplay
                startTime={metadata.start}
                endTime={metadata.end}
              />
              <EventLocationText location={metadata.location} />
              <Typography variant="body1" paragraph>
                {metadata.summary}
              </Typography>
            </Grid>
            <Grid size={2}>{event && <EventRsvpMenu event={event} />}</Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ mt: 3 }}>
            {metadata.references.map((reference, index) => (
              <Link
                href={reference}
                key={`link-${index}`}
                target="_blank"
                variant="body2"
                sx={{ mr: 2 }}
              >
                {reference}
              </Link>
            ))}
          </Box>
          <Box sx={{ mt: 3 }}>
            {metadata.hashtags.map((hashtag, index) => (
              <Chip
                key={`hashtag-${index}`}
                label={`#${hashtag}`}
                size="small"
                sx={{ m: 0.5 }}
              />
            ))}
            {metadata.labels.map((label, index) => (
              <Chip
                key={`label-${index}`}
                label={`${label}`}
                size="small"
                sx={{ m: 0.5 }}
              />
            ))}
          </Box>
        </CardContent>
      </Card>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7, lg: 8 }} order={{ xs: 2, md: 1 }}>
          <EventCommentsCard event={event} />
        </Grid>
        <Grid size={{ xs: 12, md: 5, lg: 4 }} order={{ xs: 1, md: 2 }}>
          <EventLocationMapCard metadata={metadata} />
          <EventAttendeesCard
            participants={metadata.participants.map((p) => ({ pubkey: p[0] }))}
            event={event}
          />
        </Grid>
      </Grid>

      <CreateNewEventDialog
        initialEvent={event}
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onEventUpdated={handleEventUpdated}
      />
    </Container>
  );
}
