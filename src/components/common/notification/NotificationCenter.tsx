// src/components/common/notifications/NotificationCenter.tsx
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
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useNdk, useActiveUser, useProfile } from "nostr-hooks";
import { NDKEvent, type NDKFilter } from "@nostr-dev-kit/ndk";
import { getEventMetadata } from "@/utils/nostr/eventUtils";
import EventTimeDisplay from "@/components/common/events/EventTimeDisplay";
import { nip19 } from "nostr-tools";

interface Notification {
  id: string;
  type: "calendar_invite" | "rsvp_update" | "event_update";
  event: NDKEvent;
  read: boolean;
  timestamp: number;
}

export default function NotificationCenter() {
  const { ndk } = useNdk();
  const { activeUser } = useActiveUser();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<NDKEvent[]>([]);
  const [dismissed, setDismissed] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("dismissedNotifications") || "[]");
    }
    return [];
  });

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

  // Fetch relevant calendar notifications
  const fetchCalendarNotifications = useCallback(async () => {
    if (!ndk || !activeUser) return;
    const filter: NDKFilter = {
      kinds: [31922 as any, 31923 as any, 31925 as any],
      "#p": [activeUser.pubkey],
      since: Math.floor(Date.now() / 1000) - 604800, // 1 week
    };
    const sub = ndk.subscribe(filter);
    sub.on("event", (event: NDKEvent) => handleNewEvent(event));
  }, [ndk, activeUser]);

  // Fetch user's calendar event coordinates
  const [calendarCoordinates, setCalendarCoordinates] = useState<string[]>([]);
  useEffect(() => {
    if (!calendarEvents.length) return;
    const coords = calendarEvents
      .map((cal) => {
        const dTag = cal.tags.find((t) => t[0] === "d");
        return dTag ? `31924:${cal.pubkey}:${dTag[1]}` : null;
      })
      .filter(Boolean) as string[];
    setCalendarCoordinates(coords);
  }, [calendarEvents]);

  // Subscribe for events referencing user's calendar via 'a' tag
  useEffect(() => {
    if (!ndk || !calendarCoordinates.length) return;
    const filter: NDKFilter = {
      kinds: [31922 as any, 31923 as any],
      "#a": calendarCoordinates,
      since: Math.floor(Date.now() / 1000) - 604800,
    };
    const sub = ndk.subscribe(filter);
    sub.on("event", (event: NDKEvent) => handleNewEvent(event));
    return () => sub.stop();
  }, [ndk, calendarCoordinates]);

  // Check if event is already accepted in any calendar
  const isEventAccepted = (event: NDKEvent) => {
    const eventCoordinate = (() => {
      const dTag = event.tags.find((t) => t[0] === "d");
      return dTag ? `${event.kind}:${event.pubkey}:${dTag[1]}` : null;
    })();
    return calendarEvents.some((cal) =>
      cal.tags.some((t) => t[0] === "a" && t[1] === eventCoordinate)
    );
  };

  // Add new notification if not already accepted or dismissed
  const handleNewEvent = (event: NDKEvent) => {
    if (isEventAccepted(event) || dismissed.includes(event.id)) return;
    setNotifications((prev) => {
      const exists = prev.some((n) => n.event.id === event.id);
      if (exists) return prev;
      const notificationType =
        event.kind === 31925
          ? "rsvp_update"
          : [31922, 31923].includes(event.kind)
            ? "calendar_invite"
            : "event_update";
      return [
        {
          id: event.id,
          type: notificationType,
          event,
          read: false,
          timestamp: event.created_at || Date.now(),
        },
        ...prev,
      ];
    });
  };

  useEffect(() => {
    fetchCalendarNotifications();
  }, [fetchCalendarNotifications, calendarEvents, dismissed]);

  // Accept event: add to calendar
  const handleAcceptEvent = async (notificationId: string) => {
    const notification = notifications.find((n) => n.id === notificationId);
    if (!notification || !ndk || !activeUser) return;
    // Find the user's main calendar (first 31924 event)
    const calendar = calendarEvents[0];
    if (!calendar) return;
    // Compute event coordinate
    const event = notification.event;
    const dTag = event.tags.find((t) => t[0] === "d");
    const eventCoordinate = dTag
      ? `${event.kind}:${event.pubkey}:${dTag[1]}`
      : null;
    if (!eventCoordinate) return;
    // If already present, skip
    if (calendar.tags.some((t) => t[0] === "a" && t[1] === eventCoordinate))
      return;
    // Update calendar event
    const updatedCalendar = new NDKEvent(ndk);
    updatedCalendar.kind = 31924 as any;
    updatedCalendar.pubkey = calendar.pubkey;
    updatedCalendar.tags = [
      ...calendar.tags.filter(
        (t) => !(t[0] === "a" && t[1] === eventCoordinate)
      ),
      ["a", eventCoordinate],
    ];
    updatedCalendar.content = calendar.content || "";
    updatedCalendar.created_at = Math.floor(Date.now() / 1000);
    await updatedCalendar.sign();
    await updatedCalendar.publish();
    // Remove notification
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  };

  // Dismiss notification and persist
  const handleDismiss = (notificationId: string) => {
    setDismissed((prev) => {
      const updated = [...prev, notificationId];
      localStorage.setItem("dismissedNotifications", JSON.stringify(updated));
      return updated;
    });
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  };

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
        <Box sx={{ p: 2, width: 400 }}>
          <Typography variant="h6" gutterBottom>
            Notifications
          </Typography>
          {notifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onAccept={handleAcceptEvent}
              onDismiss={handleDismiss}
            />
          ))}
          {notifications.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No new notifications
            </Typography>
          )}
        </Box>
      </Popover>
    </Box>
  );
}

// NotificationCard with user, calendar, and event info
const NotificationCard = ({
  notification,
  onAccept,
  onDismiss,
}: {
  notification: Notification;
  onAccept: (id: string) => void;
  onDismiss: (id: string) => void;
}) => {
  const metadata = getEventMetadata(notification.event);
  // Find inviter (first 'p' tag not the active user)
  const inviterPubkey = notification.event.tags.find((t) => t[0] === "p")?.[1];
  const { profile } = useProfile({ pubkey: inviterPubkey });
  const npub = inviterPubkey ? nip19.npubEncode(inviterPubkey) : null;
  // Calendar info (from 'a' tag or similar)
  const calendarRef = notification.event.tags.find((t) => t[0] === "a");
  let calendarInfo = null;
  if (calendarRef) {
    const [kind, pubkey, d] = calendarRef[1]?.split(":") || [];
    calendarInfo = { kind, pubkey, d };
  }
  return (
    <Card sx={{ mb: 2 }}>
      <CardHeader
        avatar={
          profile && npub ? (
            <IconButton
              onClick={() => window.open(`https://njump.me/${npub}`, "_blank")}
            >
              <img
                src={profile.image || "/default-avatar.png"}
                alt={profile.displayName || npub}
                style={{ width: 40, height: 40, borderRadius: "50%" }}
              />
            </IconButton>
          ) : null
        }
        title={metadata.title || "New Event"}
        subheader={<EventTimeDisplay startTime={metadata.start} />}
      />
      <CardContent>
        {profile && (
          <Typography variant="subtitle2" gutterBottom>
            Invited by: {profile.displayName || npub}
          </Typography>
        )}
        {calendarInfo && (
          <Typography variant="caption" color="text.secondary" display="block">
            Calendar:{" "}
            <a href={`/calendar/${calendarInfo.pubkey}`}>
              {calendarInfo.d || calendarInfo.pubkey}
            </a>
          </Typography>
        )}
        <Typography variant="body2">{metadata.summary}</Typography>
        {metadata.location && (
          <Typography variant="caption" color="text.secondary">
            Location: {metadata.location}
          </Typography>
        )}
      </CardContent>
      <CardActions>
        <Button size="small" onClick={() => onAccept(notification.id)}>
          Accept
        </Button>
        <Button size="small" onClick={() => onDismiss(notification.id)}>
          Dismiss
        </Button>
      </CardActions>
    </Card>
  );
};
