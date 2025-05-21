// src/components/common/events/EventSection.tsx
import React from "react";
import { Box, Typography, Divider, Grid } from "@mui/material";
import { type NDKEvent } from "@nostr-dev-kit/ndk";
import EventPreviewCard from "@/components/common/events/EventPreviewCard";

interface EventSectionProps {
  title: string;
  events: NDKEvent[];
  fallbackText: string;
}

const EventSection: React.FC<EventSectionProps> = ({
  title,
  events,
  fallbackText,
}) => (
  <Box sx={{ mb: 4 }}>
    <Typography variant="h5" component="h2" gutterBottom>
      {title}
    </Typography>
    <Divider sx={{ mb: 2 }} />

    {events.length > 0 ? (
      <Grid container spacing={3}>
        {events.map((event, idx) => (
          <Grid
            size={{ xs: 12, md: 6 }}
            key={`event-${event.id}-${idx}`}
            sx={{ width: "100%" }}
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
