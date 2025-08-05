"use client";
import React, { useState, useEffect } from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import PopularCalendars from "@/components/common/calendar/PopularCalendars";
import UpcomingEventsSection from "@/components/common/events/UpcomingEventsSection";
import DelegationNotification from "@/components/calendar/DelegationNotification";
import { useTranslation } from "react-i18next";

export default function Home() {
  const { t } = useTranslation();
  const [isClient, setIsClient] = useState(false);

  // Prevent hydration mismatch by only rendering after client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // during SSR/hydration
  if (!isClient) return null;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <DelegationNotification />

      <UpcomingEventsSection
        title={t("events.upcomingEvents", "Discover Upcoming Events")}
        showFilters={true}
      />

      <Divider sx={{ my: 5 }} />

      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {t("startpage.popularCalendars", "Popular Calendars")}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <PopularCalendars />
      </Box>
    </Container>
  );
}
