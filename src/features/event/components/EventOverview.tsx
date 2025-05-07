// src/features/event/components/EventOverview.tsx
import * as React from 'react';
import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNdk } from 'nostr-hooks';
import { NDKEvent } from '@nostr-dev-kit/ndk';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Container, 
  Box,
  Chip,
  Divider,
  Grid
} from '@mui/material';
import { fetchEventById } from '@/utils/nostrUtils';
import { getEventMetadata } from '@/utils/eventUtils';
import EventLocationText from '@/components/common/events/EventLocationText/EventLocationText';
import EventTimeDisplay from '@/components/common/events/EventTimeDisplay/EventTimeDisplay';
import { useNostrEvent } from '@/hooks/useNostrEvent';
import EventLocationMapCard from '@/components/common/events/EventLocationMapCard/EventLocationMapCard';
import EventRsvpMenu from '@/components/common/events/EventRsvpMenu/EventRsvpMenu';
import EventAttendeesCard from '@/components/common/events/EventAttendeesCard/EventAttendeesCard';

export default function EventOverview({ eventId }: { eventId?: string }) {
  const { t } = useTranslation();
  const { event, loading, errorCode, fetchEvent } = useNostrEvent();
  const expectedKinds = useMemo(() => [31922, 31923], []);

  useEffect(() => {
    if (eventId) {
      fetchEvent(eventId, expectedKinds);
    }
  }, [eventId, fetchEvent, expectedKinds]);

  const errorMessage = useMemo(() => {
    if (!errorCode) return null;
    switch (errorCode) {
      case 'not_found': return t('error.event.notFound');
      case 'invalid_kind': return t('error.event.invalidKind');
      default: return t('error.generic');
    }
  }, [errorCode, t]);

  if (loading) return <Typography>{t('common.loading')}</Typography>;
  if (errorCode) return <Typography color="error">{errorCode}</Typography>;

  if (!event) {
    return (
      <Typography variant="h4">
        {t('error.event.invalidId')}
      </Typography>
    );
  }

  const metadata = getEventMetadata(event);


  return (
    <Container maxWidth="lg" sx={{ mb: 4 }}>
      <Card sx={{ width: '100%', mb: 4 }}>
        {metadata.image && (
          <CardMedia
            component="img"
            alt={metadata.title || ''}
            height="300"
            image={metadata.image}
            sx={{ objectFit: 'cover' }}
          />
        )}
        <CardContent>
          <Grid container>
            <Grid size={ 10 }>
              <Typography gutterBottom variant="h4" component="div">
                {metadata.title || t('error.event.noName', 'Unnamed Event')}
              </Typography>
              <EventTimeDisplay startTime={metadata.start} endTime={metadata.end} />
              <EventLocationText location={metadata.location} />
              <Typography variant="body1" paragraph>
                {metadata.summary || t('error.event.noDescription', 'No description provided')}
              </Typography>
            </Grid>
            <Grid size={ 2 }>
              {event && <EventRsvpMenu event={event} />}
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          
          {/* Event tags/categories */}
          <Box sx={{ mt: 3 }}>
            {event.tags
              .filter(tag => ['t', 'hashtag'].includes(tag[0]))
              .map((tag, index) => (
                <Chip 
                  key={`tag-${index}`} 
                  label={tag[1]} 
                  size="small" 
                  sx={{ m: 0.5 }} 
                />
              ))
            }
          </Box>
        </CardContent>
      </Card>          
      <Grid container>
        <Grid size={{ xs: 12, md: 7, lg: 8 }}>
        </Grid>
        <Grid size={{ xs: 12, md: 5, lg: 4 }}>
          <EventLocationMapCard metadata={metadata} />
          <EventAttendeesCard 
            participants={metadata.participants.map(p => ({ pubkey: p[0] }))}
            event={event}
          />
        </Grid>
      </Grid>
    </Container>
  );
}
