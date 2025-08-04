// src/app/event/[id]/EventPageClient.tsx
"use client";
import * as React from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import EventOverview from "@/features/event/components/EventOverview";
import { CircularProgress } from "@mui/material";

interface EventPageClientProps {
  params: Promise<{ id: string }>;
}

export default function EventPageClient({ params }: EventPageClientProps) {
  const [eventId, setEventId] = React.useState<string>("");
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    params.then((resolved) => {
      setEventId(resolved.id);
    });
  }, [params]);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Show loading during hydration to prevent mismatch
  if (!isClient) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <EventOverview eventId={eventId} />
      </Box>
    </Container>
  );
}
