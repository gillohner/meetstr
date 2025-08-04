// src/app/page.tsx
import * as React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import PopularCalendars from "@/components/common/calendar/PopularCalendars";
import UpcomingEventsSection from "@/components/common/events/UpcomingEventsSection";

export default function Home() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{ mb: 3, textAlign: "center", fontWeight: 700 }}
        >
          Popular Calendars
        </Typography>
        <PopularCalendars />

        <Divider sx={{ my: 5 }} />

        <UpcomingEventsSection
          title="Discover Upcoming Events"
          maxEvents={12}
          showFilters={true}
        />
      </Box>
    </Container>
  );
}
