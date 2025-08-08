// src/features/calendar/components/CalendarOverview.tsx
import * as React from "react";
import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNdk } from "nostr-hooks";
import { type NDKEvent } from "@nostr-dev-kit/ndk";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Container,
  Grid,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  Fab,
  Tooltip,
  IconButton,
} from "@mui/material";
import { Add as AddIcon, Person as PersonIcon } from "@mui/icons-material";
import { fetchCalendarEvents } from "@/utils/nostr/nostrUtils";
import { fetchEvents } from "@/utils/nostr/eventCacheUtils";
import { useNostrEvent } from "@/hooks/useNostrEvent";
import EventSection from "@/components/common/events/EventSection";
import { getEventMetadata } from "@/utils/nostr/eventUtils";
import CreateCalendarForm from "@/components/NostrEventCreation/CreateCalendarForm";
import { useNostrUrlUpdate } from "@/hooks/useNostrUrlUpdate";
import EventHost from "@/components/common/events/EventHost";
import EventActionsMenu from "@/components/common/events/EventActionsMenu";
import { useActiveUser } from "@/hooks/useActiveUser";
import { useSnackbar } from "@/context/SnackbarContext";
import FloatingActionButton from "@/components/common/layout/FloatingActionButton";
import CreateNewEventDialog from "@/components/common/events/CreateNewEventDialog";
import AddToCalendarIcsButton from "@/components/common/events/AddToCalendarButton";

interface CalendarOverviewProps {
  calendarId?: string;
}

export default function CalendarOverview({
  calendarId,
}: CalendarOverviewProps) {
  const { ndk } = useNdk();
  const { t } = useTranslation();
  const { updateUrlWithNip19 } = useNostrUrlUpdate();
  const {
    event: calendarEvent,
    loading,
    errorCode,
    fetchEvent,
    removeEvent,
  } = useNostrEvent();
  const [upcomingEvents, setUpcomingEvents] = useState<NDKEvent[]>([]);
  const [pastEvents, setPastEvents] = useState<NDKEvent[]>([]);
  const [showUnapproved, setShowUnapproved] = useState(false);
  const [unapprovedEvents, setUnapprovedEvents] = useState<NDKEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const expectedKinds = useMemo(() => [31924], []);
  const activeUser = useActiveUser();
  const { showSnackbar } = useSnackbar();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [addEventDialogOpen, setAddEventDialogOpen] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (calendarId) {
      fetchEvent(calendarId, expectedKinds);
    }
  }, [calendarId, fetchEvent, expectedKinds, ndk]);

  useEffect(() => {
    if (calendarEvent) {
      updateUrlWithNip19(calendarEvent);
    }
  }, [calendarEvent, updateUrlWithNip19]);

  // Handle calendar events fetch
  useEffect(() => {
    const loadCalendarEvents = async () => {
      if (calendarEvent && ndk) {
        setEventsLoading(true);
        const { upcoming, past } = await fetchCalendarEvents(
          ndk,
          calendarEvent
        );
        setUpcomingEvents(upcoming);
        setPastEvents(past);
        // Find unapproved events: events referencing this calendar but not in 'a' tags
        const calendarDTag = calendarEvent.tags.find((t) => t[0] === "d")?.[1];
        const calendarCoordinate = calendarDTag
          ? `31924:${calendarEvent.pubkey}:${calendarDTag}`
          : null;
        if (calendarCoordinate) {
          // Fetch all events referencing this calendar
          const filter = {
            kinds: [31922 as any, 31923 as any],
            "#a": [calendarCoordinate],
          };
          const events = await ndk.fetchEvents(filter);
          // Only include those not already in the calendar's 'a' tags
          const approvedCoords = new Set(
            calendarEvent.tags.filter((t) => t[0] === "a").map((t) => t[1])
          );
          const unapproved = Array.from(events.values()).filter((ev) => {
            const dTag = ev.tags.find((t) => t[0] === "d")?.[1];
            const coord = dTag ? `${ev.kind}:${ev.pubkey}:${dTag}` : null;
            return coord && !approvedCoords.has(coord);
          });
          setUnapprovedEvents(unapproved);
        }
        setEventsLoading(false);
      }
    };
    loadCalendarEvents();
  }, [calendarEvent, ndk]);

  const handleEdit = () => {
    setEditDialogOpen(true);
  };

  const handleDelete = async (event: any) => {
    const isOwner = activeUser && event && activeUser.pubkey === event.pubkey;
    if (!isOwner) return;

    if (window.confirm(t("event.delete.confirm"))) {
      try {
        await removeEvent(event, t("event.delete.reason"));
        showSnackbar(t("event.delete.success"), "success");
      } catch (error) {
        console.error("Error deleting calendar:", error);
        showSnackbar(t("event.delete.error"), "error");
      }
    }
  };

  const handleCalendarUpdated = (updatedCalendar: any) => {
    showSnackbar(t("calendar.edit.success"), "success");
    setEditDialogOpen(false);
    fetchEvent(updatedCalendar.id, expectedKinds);
  };

  if (!calendarEvent) {
    if (loading)
      return (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      );
    if (errorCode) return <Typography color="error">{errorCode}</Typography>;

    return <Typography variant="h4">Invalid Calendar ID</Typography>;
  }

  // Don't render main content until client-side hydration to prevent mismatch
  if (!isClient) {
    return (
      <Container maxWidth="lg" sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // Extract metadata using the utility function
  const metadata = getEventMetadata(calendarEvent);
  const isCalendarOwner =
    activeUser && calendarEvent && activeUser.pubkey === calendarEvent.pubkey;

  console.log("Calendar metadata:", metadata);
  // Merge unapproved events into the correct sections if toggle is on
  const allUpcomingEvents = showUnapproved
    ? [
        ...upcomingEvents,
        ...unapprovedEvents.filter((ev) => {
          const startTag = ev.tags.find((t) => t[0] === "start");
          return startTag && parseInt(startTag[1]) > Date.now() / 1000;
        }),
      ]
    : upcomingEvents;
  const allPastEvents = showUnapproved
    ? [
        ...pastEvents,
        ...unapprovedEvents.filter((ev) => {
          const startTag = ev.tags.find((t) => t[0] === "start");
          return startTag && parseInt(startTag[1]) <= Date.now() / 1000;
        }),
      ]
    : pastEvents;

  // ToggleButtonGroup for filtering
  const filterValue = showUnapproved ? "all" : "approved";

  return (
    <Container maxWidth="lg" sx={{ mb: 4 }}>
      <Card
        sx={{ width: "100%", mb: 4, position: "relative", overflow: "visible" }}
      >
        {/* EventActionsMenu positioned in top-right corner for calendar owner */}
        {isCalendarOwner && (
          <EventActionsMenu
            onEdit={handleEdit}
            onDelete={() => handleDelete(calendarEvent)}
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
            }}
          />
        )}

        {metadata.image ? (
          <CardMedia
            component="img"
            alt={metadata.summary || ""}
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
          <Grid container spacing={2} direction="row">
            <Grid size={{ xs: 12, sm: 9 }}>
              <Typography gutterBottom variant="h4" component="div">
                {metadata.title || "Calendar"}
              </Typography>
              <EventHost hostPubkey={calendarEvent.pubkey} />
              <Typography variant="body1" color="text.secondary">
                {metadata.summary || ""}
              </Typography>
            </Grid>
            <Grid
              size={{ xs: 12, sm: 3 }}
              sx={{
                display: "flex",
                flexDirection: "row",
                gap: 1,
                justifyContent: "flex-end",
                alignItems: "flex-start",
              }}
            >
              {/* Add Event Button */}
              {isClient && activeUser && (
                <IconButton
                  color="warning"
                  onClick={() => setAddEventDialogOpen(true)}
                  sx={{
                    width: 40,
                    height: 40,
                    backgroundColor: "warning.main",
                    color: "warning.contrastText",
                    "&:hover": {
                      backgroundColor: "warning.dark",
                    },
                  }}
                >
                  <AddIcon />
                </IconButton>
              )}
              {/* ICS subscription button */}
              <AddToCalendarIcsButton calendarEvent={calendarEvent} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      {/* ToggleButtonGroup filter below card, left-aligned, orange color */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <ToggleButtonGroup
          value={filterValue}
          exclusive
          onChange={(_, val) => setShowUnapproved(val === "all")}
          sx={{ ml: 0 }}
          size="small"
        >
          <ToggleButton
            value="approved"
            sx={{
              color: "warning.main",
              borderColor: "warning.main",
              fontWeight: 500,
            }}
          >
            {isClient
              ? t("calendar.onlyApproved", "Only Approved")
              : "Only Approved"}
          </ToggleButton>
          <ToggleButton
            value="all"
            sx={{
              color: "warning.main",
              borderColor: "warning.main",
              fontWeight: 500,
            }}
          >
            {isClient ? t("calendar.allMeetups", "All Meetups") : "All Meetups"}
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <EventSection
        title={isClient ? t("calendar.upcomingEvents") : "Upcoming Events"}
        events={allUpcomingEvents}
        fallbackText={
          isClient ? t("calendar.noUpcomingEvents") : "No upcoming events"
        }
        loading={eventsLoading}
      />
      <EventSection
        title={isClient ? t("calendar.pastEvents") : "Past Events"}
        events={allPastEvents}
        fallbackText={isClient ? t("calendar.noPastEvents") : "No past events"}
        loading={eventsLoading}
      />

      <CreateCalendarForm
        initialCalendar={calendarEvent}
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onCalendarUpdated={handleCalendarUpdated}
      />

      <CreateNewEventDialog
        open={addEventDialogOpen}
        onClose={() => setAddEventDialogOpen(false)}
        calendarEvent={calendarEvent}
      />

      <FloatingActionButton
        calendarEvent={calendarEvent}
        isOwner={!!isCalendarOwner}
      />
    </Container>
  );
}
