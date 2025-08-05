// src/components/common/events/EventCalendarsCard.tsx
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { useNdk } from "nostr-hooks";
import { type NDKEvent, type NDKFilter } from "@nostr-dev-kit/ndk";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Avatar,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { getEventMetadata } from "@/utils/nostr/eventUtils";

interface EventCalendarsCardProps {
  event: NDKEvent;
}

const EventCalendarsCard: React.FC<EventCalendarsCardProps> = ({ event }) => {
  const { t } = useTranslation();
  const { ndk } = useNdk();
  const router = useRouter();
  const [calendars, setCalendars] = useState<NDKEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReferencingCalendars = async () => {
      if (!ndk || !event) return;

      setLoading(true);
      try {
        // Build the event coordinate for this event
        const dTag = event.tags.find((t) => t[0] === "d")?.[1];
        const eventCoordinate = dTag
          ? `${event.kind}:${event.pubkey}:${dTag}`
          : null;

        if (!eventCoordinate) {
          setLoading(false);
          return;
        }

        // Find all calendars (kind 31924) that reference this event in their 'a' tags
        const filter: NDKFilter = {
          kinds: [31924 as any],
          "#a": [eventCoordinate],
        };

        const calendarEvents = await ndk.fetchEvents(filter);
        const calendarList = Array.from(calendarEvents.values());

        // Sort by most recent first
        calendarList.sort((a, b) => (b.created_at || 0) - (a.created_at || 0));

        setCalendars(calendarList);
      } catch (error) {
        console.error("Error fetching referencing calendars:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReferencingCalendars();
  }, [ndk, event]);

  const handleCalendarClick = (calendar: NDKEvent) => {
    router.push(`/calendar/${calendar.id}`);
  };

  if (loading) {
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <CalendarMonthIcon sx={{ mr: 1 }} color="primary" />
            <Typography variant="h6">
              {t("event.calendars.title", "In Kalendern enthalten")}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
            <CircularProgress size={24} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (calendars.length === 0) {
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <CalendarMonthIcon sx={{ mr: 1 }} color="primary" />
            <Typography variant="h6">
              {t("event.calendars.title", "Featured in Calendars")}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {t(
              "event.calendars.none",
              "Dieses Event ist noch in keinem Kalender enthalten."
            )}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <CalendarMonthIcon sx={{ mr: 1 }} color="primary" />
          <Typography variant="h6">
            {t("event.calendars.title", "Featured in Calendars")}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {calendars.map((calendar) => {
            const metadata = getEventMetadata(calendar);
            return (
              <Box
                key={calendar.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  p: 1,
                  borderRadius: 1,
                  backgroundColor: "action.hover",
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "action.selected",
                  },
                }}
                onClick={() => handleCalendarClick(calendar)}
              >
                {metadata.image ? (
                  <Avatar
                    src={metadata.image}
                    alt={metadata.title || "Calendar"}
                    sx={{ width: 32, height: 32, mr: 1 }}
                  />
                ) : (
                  <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                    <CalendarMonthIcon fontSize="small" />
                  </Avatar>
                )}

                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography
                    variant="subtitle2"
                    noWrap
                    sx={{ fontWeight: 500 }}
                  >
                    {metadata.title ||
                      t("error.event.noName", "Untitled Calendar")}
                  </Typography>
                  {metadata.summary && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: "-webkit-box",
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {metadata.summary}
                    </Typography>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
};

export default EventCalendarsCard;
