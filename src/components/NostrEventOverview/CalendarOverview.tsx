// src/components/NostrEventOverview/CalendarOverview.tsx
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNdk } from 'nostr-hooks';
import { NDKEvent } from '@nostr-dev-kit/ndk';
import { Card, CardContent, CardMedia, Typography, Container } from '@mui/material';
import { fetchEventById, fetchCalendarEvents } from '@/utils/nostrUtils';
import EventSection from './EventSection';
import { getEventMetadata } from '@/utils/eventUtils';

export default function CalendarOverview({ calendarId }: { calendarId?: string }) {
  const { ndk } = useNdk();
  const { t } = useTranslation();
  const [calendarEvent, setCalendarEvent] = useState<NDKEvent | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<NDKEvent[]>([]);
  const [pastEvents, setPastEvents] = useState<NDKEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ndk || !calendarId) return;

    const loadCalendar = async () => {
      try {
        const event = await fetchEventById(ndk, calendarId);
        if (!event || event.kind !== 31924) {
          setCalendarEvent(null);
          return;
        }

        setCalendarEvent(event);
        const { upcoming, past } = await fetchCalendarEvents(ndk, event);
        setUpcomingEvents(upcoming);
        setPastEvents(past);
      } catch (error) {
        console.error('Calendar loading error:', error);
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    loadCalendar();
  }, [ndk, calendarId]);

  if (loading) return <Typography>{t('common.loading')}</Typography>;
  
  if (!calendarEvent) return (
    <Typography variant="h4">
      {t('error.calendar.invalidId')}
    </Typography>
  );

  // Extract metadata using the utility function
  const metadata = getEventMetadata(calendarEvent);

  return (
    <Container maxWidth="lg" sx={{ mb: 4 }}>
      <Card sx={{ width: '100%', mb: 4 }}>
        <CardMedia
          component="img"
          alt={metadata.description || ''}
          height="300"
          image={metadata.image || ''}
          sx={{ objectFit: 'cover' }}
        />
        <CardContent>
          <Typography gutterBottom variant="h4" component="div">
            {metadata.name || t('error.calendar.noName')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {metadata.description || ''}
          </Typography>
        </CardContent>
      </Card>

      <EventSection 
        title={t('calendar.upcomingEvents')}
        events={upcomingEvents}
        fallbackText={t('calendar.noUpcomingEvents')}
      />

      <EventSection
        title={t('calendar.pastEvents')}
        events={pastEvents}
        fallbackText={t('calendar.noPastEvents')}
      />
    </Container>
  );
}
