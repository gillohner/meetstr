// src/features/event/components/EventOverview.tsx
import * as React from 'react';
import { useEffect, useState } from 'react';
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
  Divider 
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import { fetchEventById } from '@/utils/nostrUtils';
import { getEventMetadata } from '@/utils/eventUtils';
import EventLocationDisplay from '@/components/common/events/EventLocationDisplay/EventLocationDisplay';
import EventTimeDisplay from '@/components/common/events/EventTimeDisplay/EventTimeDisplay';

export default function EventOverview({ eventId }: { eventId?: string }) {
  const { ndk } = useNdk();
  const { t } = useTranslation();
  const [event, setEvent] = useState<NDKEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ndk || !eventId) {
      setLoading(false);
      return;
    }

    const loadEvent = async () => {
      try {
        const fetchedEvent = await fetchEventById(ndk, eventId);
        
        // Check if event is of the correct kind
        if (!fetchedEvent) {
          setError('Nostr event not found in Relays');
          setEvent(null);
          return;
        }
        if (!fetchedEvent || (fetchedEvent.kind !== 31922 && fetchedEvent.kind !== 31923)) {
          setError('Invalid event type. Only event kinds 31922 and 31923 are supported.');
          setEvent(null);
          return;
        }

        setEvent(fetchedEvent);
        setError(null);
      } catch (err) {
        console.error('Error loading event:', err);
        setError('Failed to load event details.');
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    loadEvent();
  }, [ndk, eventId]);

  if (loading) return <Typography>{t('common.loading')}</Typography>;
  
  if (error) return <Typography variant="h5" color="error">{error}</Typography>;
  
  if (!event) return (
    <Typography variant="h4">
      {t('error.event.invalidId', 'Invalid event ID')}
    </Typography>
  );

  // Extract metadata using the utility function
  const metadata = getEventMetadata(event);
  console.log('Event Metadata:', metadata);

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
          <Typography gutterBottom variant="h4" component="div">
            {metadata.title || t('error.event.noName', 'Unnamed Event')}
          </Typography>
          
          {status && (
            <Chip 
              label={status.charAt(0).toUpperCase() + status.slice(1)} 
              color={status === 'cancelled' ? 'error' : 'success'} 
              size="small" 
              sx={{ mb: 2 }} 
            />
          )}

          <EventTimeDisplay startTime={metadata.start} endTime={metadata.end} />
          <EventLocationDisplay location={metadata.location} />

          <Divider sx={{ my: 2 }} />
          
          <Typography variant="body1" paragraph>
            {metadata.summary || t('error.event.noDescription', 'No description provided')}
          </Typography>
          
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
    </Container>
  );
}
