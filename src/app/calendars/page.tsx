"use client";
import React, { useState, useEffect } from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import PopularCalendars from "@/components/common/calendar/PopularCalendars";
import { useTranslation } from "react-i18next";

export default function CalendarsPage() {
  const { t } = useTranslation();
  const [isClient, setIsClient] = useState(false);

  // Prevent hydration mismatch by only rendering after client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <Container maxWidth="lg" sx={{ py: 4, px: { xs: 1, sm: 3 } }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t("calendars.title", "Calendars")}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t(
            "calendars.description",
            "Browse and subscribe to event calendars"
          )}
        </Typography>
      </Box>

      <PopularCalendars />
    </Container>
  );
}
