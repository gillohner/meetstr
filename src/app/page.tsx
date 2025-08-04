// src/app/page.tsx
"use client";
import * as React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import PopularCalendars from "@/components/common/calendar/PopularCalendars";
import UpcomingEventsSection from "@/components/common/events/UpcomingEventsSection";
import { useTranslation } from "react-i18next";

export default function Home() {
  const { t } = useTranslation();

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <UpcomingEventsSection
          title={t("events.upcomingEvents", "Discover Upcoming Events")}
          maxEvents={20}
          showFilters={true}
        />

        <Divider sx={{ my: 5 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            {t("nav.startpage", "Popular Calendars")}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <PopularCalendars />
        </Box>
      </Box>
    </Container>
  );
}
