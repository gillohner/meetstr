// src/app/new-calendar/page.tsx
"use client";
import * as React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { CreateCalendarForm } from "@/components/NostrEventCreation";
import { useTranslation } from "react-i18next";

export default function NewCalendar() {
  const { t } = useTranslation();

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
        <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
          {t("createCalendar.title")}
        </Typography>
        <Box
          sx={{
            my: 4,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CreateCalendarForm />
        </Box>
      </Box>
    </Container>
  );
}
