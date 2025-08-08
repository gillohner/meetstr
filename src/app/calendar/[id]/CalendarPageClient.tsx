"use client";
import * as React from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import CalendarOverview from "@/features/calendar/components/CalendarOverview";
import { useParams } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

export default function CalendarPageClient({ params }: Props) {
  const routeParams = useParams();
  const id = routeParams?.id?.toString() || "";

  return (
    <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 3 } }}>
      <Box sx={{ my: 4 }}>
        <CalendarOverview calendarId={id} />
      </Box>
    </Container>
  );
}
