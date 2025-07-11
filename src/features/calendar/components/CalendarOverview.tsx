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
} from "@mui/material";
import { fetchCalendarEvents } from "@/utils/nostr/nostrUtils";
import { useNostrEvent } from "@/hooks/useNostrEvent";
import EventSection from "@/components/common/events/EventSection";
import { getEventMetadata } from "@/utils/nostr/eventUtils";
import CreateNewEventDialog from "@/components/common/events/CreateNewEventDialog";
import { useNostrUrlUpdate } from "@/hooks/useNostrUrlUpdate";
import EventHost from "@/components/common/events/EventHost";

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
  } = useNostrEvent();
  const [upcomingEvents, setUpcomingEvents] = useState<NDKEvent[]>([]);
  const [pastEvents, setPastEvents] = useState<NDKEvent[]>([]);
  const [showUnapproved, setShowUnapproved] = useState(false);
  const [unapprovedEvents, setUnapprovedEvents] = useState<NDKEvent[]>([]);
  const expectedKinds = useMemo(() => [31924], []);

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
      }
    };
    loadCalendarEvents();
  }, [calendarEvent, ndk]);

  if (!calendarEvent) {
    if (loading)
      return (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      );
    if (errorCode) return <Typography color="error">{errorCode}</Typography>;

    return <Typography variant="h4">{t("error.event.invalidId")}</Typography>;
  }

  // Extract metadata using the utility function
  const metadata = getEventMetadata(calendarEvent);

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
      <Card sx={{ width: "100%", mb: 4 }}>
        <CardMedia
          component="img"
          alt={metadata.summary || ""}
          height="300"
          image={metadata.image || ""}
          sx={{ objectFit: "cover" }}
        />
        <CardContent>
          <Grid container spacing={2} direction="row">
            <Grid size={10}>
              <Typography gutterBottom variant="h4" component="div">
                {metadata.title || t("error.event.noName")}
              </Typography>
              <EventHost hostPubkey={calendarEvent.pubkey} />
              <Typography variant="body1" color="text.secondary">
                {metadata.summary || ""}
              </Typography>
            </Grid>
            <Grid size={2}>
              {calendarEvent && (
                <CreateNewEventDialog calendarEvent={calendarEvent} />
              )}
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
            {t("calendar.onlyApproved", "Only Approved")}
          </ToggleButton>
          <ToggleButton
            value="all"
            sx={{
              color: "warning.main",
              borderColor: "warning.main",
              fontWeight: 500,
            }}
          >
            {t("calendar.allMeetups", "All Meetups")}
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <EventSection
        title={t("calendar.upcomingEvents")}
        events={allUpcomingEvents}
        fallbackText={t("calendar.noUpcomingEvents")}
      />
      <EventSection
        title={t("calendar.pastEvents")}
        events={allPastEvents}
        fallbackText={t("calendar.noPastEvents")}
      />
    </Container>
  );
}
