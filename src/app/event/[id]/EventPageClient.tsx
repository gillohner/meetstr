// src/app/event/[id]/EventPageClient.tsx
"use client";
import * as React from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import EventOverview from "@/features/event/components/EventOverview";
import { useParams } from "next/navigation";

interface EventPageClientProps {
  params: Promise<{ id: string }>;
}

export default function EventPageClient({ params }: EventPageClientProps) {
  const [eventId, setEventId] = React.useState<string>("");

  React.useEffect(() => {
    params.then((resolved) => {
      setEventId(resolved.id);
    });
  }, [params]);

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <EventOverview eventId={eventId} />
      </Box>
    </Container>
  );
}
