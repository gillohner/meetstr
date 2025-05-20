// src/features/calendar/components/CalendarOverview.tsx
import * as React from "react";
import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNdk } from "nostr-hooks";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import { Card, CardContent, CardMedia, Typography, Container, Grid } from "@mui/material";
import { fetchCalendarEvents } from "@/utils/nostr/nostrUtils";
wmport { useNostrEvent } from "@/hooks/useNostrEvent";
import EventSection from "@/components/common/events/EventSection";
import { getEventMetadata } from "@/utils/nostr/eventUtils";
import CreateNewEventDialog from "@/components/common/events/CreateNewEventDialog";
import { useNostrUrlUpdate } from "@/hooks/useNostrUrlUpdate";

interface CalendarOverviewProps {
  calendarId?: string;
}

export default function CalendarOverview({ calendarId }: CalendarOverviewProps) {
  const { ndk } = useNdk();
  const { t } = useTranslation();
  const { updateUrlWithNip19 } = useNostrUrlUpdate();
  const { event: calendarEvent, loading, errorCode, fetchEvent } = useNostrEvent();
  const [upcomingEvents, setUpcomingEvents] = useState<NDKEvent[]>([]);
  const [pastEvents, setPastEvents] = useState<NDKEvent[]>([]);
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
      if (calendarEvent) {
        const { upcoming, past } = await fetchCalendarEvents(ndk, calendarEvent);
        setUpcomingEvents(upcoming);
        setPastEvents(past);
      }
    };
    loadCalendarEvents();
  }, [calendarEvent, ndk]);

  if (!calendarEvent) {
    if (loading) return <Typography>{t("common.loading")}</Typography>;
    if (errorCode) return <Typography color="error">{errorCode}</Typography>;

    return <Typography variant="h4">{t("error.event.invalidId")}</Typography>;
  }

  // Extract metadata using the utility function
  const metadata = getEventMetadata(calendarEvent);

  console.log("Calendar metadata:", metadata);
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
              <Typography variant="body1" color="text.secondary">
                {metadata.summary || ""}
              </Typography>
            </Grid>
            <Grid size={2}>
              {calendarEvent && <CreateNewEventDialog calendarEvent={calendarEvent} />}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <EventSection
        title={t("calendar.upcomingEvents")}
        events={upcomingEvents}
        fallbackText={t("calendar.noUpcomingEvents")}
      />

      <EventSection
        title={t("calendar.pastEvents")}
        events={pastEvents}
        fallbackText={t("calendar.noPastEvents")}
      />
    </Container>
  );
}
