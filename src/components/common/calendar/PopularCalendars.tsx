"use client";
import React, { useEffect, useState } from "react";
import { useNdk, useActiveUser } from "nostr-hooks";
import { type NDKEvent, type NDKFilter } from "@nostr-dev-kit/ndk";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  Box,
  Button,
  CircularProgress,
} from "@mui/material";
import { getEventMetadata } from "@/utils/nostr/eventUtils";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

const PopularCalendars: React.FC = () => {
  const { ndk } = useNdk();
  const { activeUser } = useActiveUser();
  const [calendars, setCalendars] = useState<NDKEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    if (!ndk) return;
    (async () => {
      setLoading(true);
      // Fetch recent public calendars (kind 31924)
      const filter: NDKFilter = {
        kinds: [31924 as any],
        limit: 30,
      };
      const events = await ndk.fetchEvents(filter);
      // Sort by number of 'a' tags (popularity)
      const sorted = Array.from(events.values()).sort((a, b) => {
        const aCount = a.tags.filter((t) => t[0] === "a").length;
        const bCount = b.tags.filter((t) => t[0] === "a").length;
        return bCount - aCount;
      });
      setCalendars(sorted);
      setLoading(false);
    })();
  }, [ndk]);

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
        <CircularProgress aria-label={t("common.loading")} />
      </Box>
    );
  if (!calendars.length)
    return (
      <Typography sx={{ my: 4 }} align="center">
        No calendars found.
      </Typography>
    );

  return (
    <Box sx={{ my: 4 }}>
      <Grid container spacing={2} justifyContent="center">
        {calendars.slice(0, 12).map((calendar) => {
          const metadata = getEventMetadata(calendar);
          return (
            <Grid size={{ xs: 12, sm: 6, md: 3, lg: 2 }} key={calendar.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  p: 1,
                }}
              >
                {metadata.image && (
                  <CardMedia
                    component="img"
                    height="60"
                    image={metadata.image}
                    alt={metadata.title || "Calendar"}
                    sx={{
                      objectFit: "contain",
                      mb: 1,
                      width: "100%",
                    }}
                  />
                )}
                <CardContent sx={{ flexGrow: 1, p: 1, width: "100%" }}>
                  <Typography
                    variant="subtitle1"
                    noWrap
                    sx={{
                      fontWeight: 600,
                      textAlign: "center",
                    }}
                  >
                    {metadata.title || "Untitled"}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    noWrap
                    sx={{ textAlign: "center" }}
                  >
                    {metadata.summary || "No description."}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      mt: 0.5,
                      display: "block",
                      textAlign: "center",
                    }}
                  >
                    {calendar.tags.filter((t) => t[0] === "a").length} events
                  </Typography>
                </CardContent>
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  sx={{
                    mt: 1,
                    mb: 0.5,
                    width: "90%",
                  }}
                  onClick={() => router.push(`/calendar/${calendar.id}`)}
                >
                  View
                </Button>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default PopularCalendars;
