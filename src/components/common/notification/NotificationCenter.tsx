// src/components/common/notification/NotificationCenter.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Badge,
  IconButton,
  Popover,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Button,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import EventIcon from "@mui/icons-material/Event";
import { useNdk, useProfile } from "nostr-hooks";
import { useActiveUser } from "@/hooks/useActiveUser";
import { NDKEvent, type NDKFilter } from "@nostr-dev-kit/ndk";
import { getEventMetadata } from "@/utils/nostr/eventUtils";
import {
  getEventNip19Encoding,
  encodeEventToNaddr,
} from "@/utils/nostr/nostrUtils";
import { nip19 } from "nostr-tools";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import EventTimeDisplay from "@/components/common/events/EventTimeDisplay";
import EventLocationText from "@/components/common/events/EventLocationText";

interface Notification {
  id: string;
  type: "calendar_invite";
  event: NDKEvent;
  read: boolean;
  timestamp: number;
}

export default function NotificationCenter() {
  const { t } = useTranslation();
  const { ndk } = useNdk();
  const activeUser = useActiveUser();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<NDKEvent[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);

  // Initialize dismissed notifications from sessionStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("dismissedNotifications");
      if (stored) {
        setDismissed(JSON.parse(stored));
      }
    }
  }, []);

  // Fetch user's calendar events (kind 31924)
  useEffect(() => {
    if (!ndk || !activeUser) return;
    (async () => {
      const filter: NDKFilter = {
        kinds: [31924 as any],
        authors: [activeUser.pubkey],
      };
      const events = await ndk.fetchEvents(filter);
      setCalendarEvents(Array.from(events.values()));
    })();
  }, [ndk, activeUser]);

  // Get calendar coordinates for subscription
  const [calendarCoordinates, setCalendarCoordinates] = useState<string[]>([]);
  useEffect(() => {
    if (!calendarEvents.length) return;
    const coords = calendarEvents
      .map((cal) => {
        const dTag = cal.tags.find((t) => t[0] === "d")?.[1];
        return dTag ? `31924:${cal.pubkey}:${dTag}` : null;
      })
      .filter(Boolean) as string[];
    setCalendarCoordinates(coords);
  }, [calendarEvents]);

  // Check if event is already in user's calendar
  const isEventAccepted = useCallback(
    (event: NDKEvent) => {
      const dTag = event.tags.find((t) => t[0] === "d")?.[1];
      if (!dTag) return false;

      const eventCoordinate = `${event.kind}:${event.pubkey}:${dTag}`;
      return calendarEvents.some((cal) =>
        cal.tags.some((t) => t[0] === "a" && t[1] === eventCoordinate)
      );
    },
    [calendarEvents]
  );

  // Handle new events
  const handleNewEvent = useCallback(
    (event: NDKEvent) => {
      // Only handle calendar events
      if (![31922, 31923].includes(event.kind)) return;

      // Skip if already accepted or dismissed
      if (isEventAccepted(event) || dismissed.includes(event.id)) return;

      setNotifications((prev) => {
        const exists = prev.some((n) => n.event.id === event.id);
        if (exists) return prev;

        return [
          {
            id: event.id,
            type: "calendar_invite",
            event,
            read: false,
            timestamp: event.created_at || Math.floor(Date.now() / 1000),
          },
          ...prev,
        ];
      });
    },
    [isEventAccepted, dismissed]
  );

  // Subscribe to events referencing user's calendars
  useEffect(() => {
    if (!ndk || !calendarCoordinates.length) return;

    const filter: NDKFilter = {
      kinds: [31922 as any, 31923 as any],
      "#a": calendarCoordinates,
      since: Math.floor(Date.now() / 1000) - 604800, // 1 week
    };

    const sub = ndk.subscribe(filter);
    sub.on("event", handleNewEvent);

    return () => sub.stop();
  }, [ndk, calendarCoordinates, handleNewEvent]);

  // Accept event: add to calendar
  const handleAcceptEvent = async (notificationId: string) => {
    const notification = notifications.find((n) => n.id === notificationId);
    if (
      !notification ||
      !ndk ||
      !activeUser ||
      !calendarEvents.length ||
      !window.nostr
    )
      return;

    const event = notification.event;
    const dTag = event.tags.find((t) => t[0] === "d")?.[1];

    if (!dTag) return;

    // Get the target calendar from the event's 'a' tag
    const calendarRef = event.tags.find((t) => t[0] === "a");
    if (!calendarRef) return;

    const [, targetPubkey, targetDTag] = calendarRef[1]?.split(":") || [];

    // Find the target calendar that matches the reference
    const targetCalendar = calendarEvents.find((cal) => {
      const calDTag = cal.tags.find((t) => t[0] === "d")?.[1];
      return cal.pubkey === targetPubkey && calDTag === targetDTag;
    });

    if (!targetCalendar) {
      console.error("Target calendar not found");
      return;
    }

    const eventCoordinate = `${event.kind}:${event.pubkey}:${dTag}`;

    // Check if already in calendar
    if (
      targetCalendar.tags.some((t) => t[0] === "a" && t[1] === eventCoordinate)
    ) {
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      return;
    }

    try {
      // Update the specific target calendar with new event
      const unsignedCalendar = {
        kind: 31924,
        tags: [...targetCalendar.tags, ["a", eventCoordinate]],
        content: targetCalendar.content || "",
        created_at: Math.floor(Date.now() / 1000),
        pubkey: activeUser.pubkey,
      };

      // Sign with window.nostr
      const signedCalendar = await window.nostr.signEvent(unsignedCalendar);

      // Convert to NDKEvent for publishing
      const ndkCalendar = new NDKEvent(ndk, signedCalendar);
      await ndkCalendar.publish();

      // Remove notification
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (error) {
      console.error("Error accepting event:", error);
    }
  };

  // Dismiss notification
  const handleDismiss = (notificationId: string) => {
    setDismissed((prev) => {
      const updated = [...prev, notificationId];
      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          "dismissedNotifications",
          JSON.stringify(updated)
        );
      }
      return updated;
    });
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  };

  // Sort notifications by timestamp (newest first)
  const sortedNotifications = notifications.sort((a, b) => {
    return b.timestamp - a.timestamp;
  });

  if (!activeUser) return null;

  return (
    <Box>
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
        <Badge
          badgeContent={notifications.filter((n) => !n.read).length}
          color="error"
        >
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Box sx={{ p: 2, width: 400, maxHeight: 600, overflow: "auto" }}>
          {sortedNotifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onAccept={handleAcceptEvent}
              onDismiss={handleDismiss}
            />
          ))}
          {notifications.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              {t("notification.noNotifications", "No new event invitations")}
            </Typography>
          )}
        </Box>
      </Popover>
    </Box>
  );
}

// NotificationCard component
const NotificationCard = ({
  notification,
  onAccept,
  onDismiss,
}: {
  notification: Notification;
  onAccept: (id: string) => void;
  onDismiss: (id: string) => void;
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { ndk } = useNdk();
  const metadata = getEventMetadata(notification.event);
  const { profile } = useProfile({ pubkey: notification.event.pubkey });

  // Get event creator info
  const creatorNpub = nip19.npubEncode(notification.event.pubkey);
  const shortenedNpub = `${creatorNpub.slice(0, 8)}...${creatorNpub.slice(-4)}`;

  // Get target calendar info
  const calendarRef = notification.event.tags.find((t) => t[0] === "a");
  const targetCalendarInfo = calendarRef
    ? (() => {
        const [kind, pubkey, dTag] = calendarRef[1]?.split(":") || [];
        return { kind, pubkey, dTag };
      })()
    : null;

  // Get target calendar metadata
  const [targetCalendar, setTargetCalendar] = useState<NDKEvent | null>(null);
  useEffect(() => {
    if (!ndk || !targetCalendarInfo) return;
    (async () => {
      try {
        const calendar = await ndk.fetchEvent({
          kinds: [31924 as any],
          authors: [targetCalendarInfo.pubkey],
          "#d": [targetCalendarInfo.dTag],
        });
        setTargetCalendar(calendar);
      } catch (error) {
        console.error("Error fetching target calendar:", error);
      }
    })();
  }, [ndk, targetCalendarInfo]);

  const targetCalendarMetadata = targetCalendar
    ? getEventMetadata(targetCalendar)
    : null;
  const calendarName =
    targetCalendarMetadata?.title ||
    targetCalendarInfo?.dTag ||
    "Unknown Calendar";

  // Handle click to view event
  const handleViewEvent = () => {
    const eventId = getEventNip19Encoding(notification.event);
    router.push(`/event/${eventId}`);
  };

  // Handle click to view calendar
  const handleViewCalendar = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (targetCalendar) {
      const calendarNaddr = encodeEventToNaddr(targetCalendar);
      router.push(`/calendar/${calendarNaddr}`);
    }
  };

  return (
    <Card
      sx={{
        mb: 2,
        cursor: "pointer",
        border: "2px solid",
        borderColor: "warning.main",
        "&:hover": {
          borderColor: "warning.dark",
        },
      }}
      onClick={handleViewEvent}
    >
      <CardHeader
        avatar={
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              window.open(`https://njump.me/${creatorNpub}`, "_blank");
            }}
            sx={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              overflow: "hidden",
              bgcolor: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: 0,
            }}
          >
            {profile?.image ? (
              <img
                src={profile.image}
                alt={profile.displayName || "User"}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <EventIcon sx={{ color: "white" }} />
            )}
          </IconButton>
        }
        title={
          <Box>
            <Typography
              variant="body2"
              color="primary.main"
              sx={{ fontWeight: 500 }}
            >
              {profile?.displayName || shortenedNpub}{" "}
              {t("notification.wantsToAdd", "wants to add")} "
              {metadata.title || t("event.untitled", "Untitled Event")}"{" "}
              {t("notification.toYourCalendar", "to your calendar")}
            </Typography>
          </Box>
        }
        subheader={
          <Box sx={{ mt: 1 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              {t("notification.targetCalendar", "Target calendar:")}{" "}
              <Button
                variant="text"
                size="small"
                onClick={handleViewCalendar}
                sx={{
                  p: 0,
                  minWidth: "auto",
                  textTransform: "none",
                  fontSize: "inherit",
                  fontWeight: 600,
                  color: "primary.main",
                }}
              >
                {calendarName}
              </Button>
            </Typography>
            <EventTimeDisplay
              startTime={metadata.start}
              endTime={metadata.end}
              typographyProps={{
                variant: "caption",
                color: "text.secondary",
                display: "block",
              }}
            />
          </Box>
        }
      />

      {metadata.summary && (
        <CardContent sx={{ pt: 0, pb: 1 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {metadata.summary}
          </Typography>
        </CardContent>
      )}

      {metadata.location && (
        <CardContent sx={{ pt: 0, pb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <EventLocationText
              location={metadata.location}
              geohash={metadata.geohash}
              typographyProps={{
                variant: "caption",
                color: "text.secondary",
              }}
            />
          </Box>
        </CardContent>
      )}

      {metadata.hashtags && metadata.hashtags.length > 0 && (
        <CardContent sx={{ pt: 0, pb: 1 }}>
          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
            {metadata.hashtags.slice(0, 3).map((tag, index) => (
              <Chip
                key={index}
                label={`#${tag}`}
                size="small"
                variant="outlined"
                sx={{ fontSize: "0.7rem", height: 20 }}
              />
            ))}
            {metadata.hashtags.length > 3 && (
              <Chip
                label={`+${metadata.hashtags.length - 3}`}
                size="small"
                variant="outlined"
                sx={{ fontSize: "0.7rem", height: 20 }}
              />
            )}
          </Box>
        </CardContent>
      )}

      <CardActions sx={{ justifyContent: "flex-end" }}>
        <Button
          size="small"
          variant="contained"
          onClick={(e) => {
            e.stopPropagation();
            onAccept(notification.id);
          }}
          sx={{ fontWeight: 600 }}
        >
          {t("notification.accept", "Accept")}
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss(notification.id);
          }}
        >
          {t("notification.dismiss", "Dismiss")}
        </Button>
      </CardActions>
    </Card>
  );
};
