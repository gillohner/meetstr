// src/components/NostrEventOverview/EventSection.tsx
import React from 'react';
import { Box, Typography, Divider, Grid } from '@mui/material';
import { NDKEvent } from '@nostr-dev-kit/ndk';
import { EventPreviewCard } from '@/components/NostrEventOverview';

interface EventSectionProps {
  title: string;
  events: NDKEvent[];
  fallbackText: string;
}

const EventSection: React.FC<EventSectionProps> = ({ title, events, fallbackText }) => (
  <Box sx={{ mb: 4 }}>
    <Typography variant="h5" component="h2" gutterBottom>
      {title}
    </Typography>
    <Divider sx={{ mb: 2 }} />
    
    {events.length > 0 ? (
      <Grid container spacing={3}>
        {events.map((event) => (
          <Grid 
            item
            xs={12}
            lg={6}
            key={event.id || `event-${event.id}`}
            sx={{ width: '100%', height: 200 }}
        >
            <EventPreviewCard event={event} />
          </Grid>
        ))}
      </Grid>
    ) : (
      <Typography variant="body1">{fallbackText}</Typography>
    )}
  </Box>
);

export default EventSection;
