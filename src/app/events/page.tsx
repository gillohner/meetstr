"use client";
import React, { useState, useEffect } from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import OptimizedUpcomingEventsSection from "@/components/common/events/OptimizedUpcomingEventsSection";
import { useTranslation } from "react-i18next";

export default function EventsPage() {
  const { t } = useTranslation();
  const [isClient, setIsClient] = useState(false);

  // Prevent hydration mismatch by only rendering after client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t("events.title", "Events")}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t("events.description", "Discover and join events in your area")}
        </Typography>
      </Box>

      <OptimizedUpcomingEventsSection
        title={t("events.upcomingEvents", "Upcoming Events")}
        showFilters={true}
      />
    </Container>
  );
}
