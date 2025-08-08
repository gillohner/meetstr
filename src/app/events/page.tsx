"use client";
import React, { useState, useEffect } from "react";
import Container from "@mui/material/Container";
import UpcomingEventsSection from "@/components/common/events/UpcomingEventsSection";
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
    <Container maxWidth="lg" sx={{ py: 4, px: { xs: 1, sm: 3 } }}>
      <UpcomingEventsSection />
    </Container>
  );
}
