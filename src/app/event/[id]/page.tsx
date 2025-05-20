// src/app/event/[id]/page.tsx
"use client";
import * as React from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import EventOverview from "@/features/event/components/EventOverview";
import { useParams } from "next/navigation";

export default function Event() {
  const params = useParams();
  const id = params?.id?.toString() || ""; // Access the dynamic route parameter

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          my: 4,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <EventOverview eventId={id} />
      </Box>
    </Container>
  );
}
