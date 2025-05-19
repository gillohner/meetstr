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
import { useNdk } from "nostr-hooks";
import { NDKEvent, NDKFilter } from "@nostr-dev-kit/ndk";
import { useActiveUser } from "nostr-hooks";
import { getEventMetadata } from "@/utils/nostr/eventUtils";
import EventTimeDisplay from "@/components/common/events/EventTimeDisplay";

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

  // Fetch relevant calendar events
  const fetchCalendarNotifications = useCallback(async () => {
    if (!ndk || !activeUser) return;

    const filter: NDKFilter = {
      kinds: [31922, 31923, 31925],
      "#p": [activeUser.pubkey],
      since: Math.floor(Date.now() / 1000) - 604800, // 1 week
    };

    const sub = ndk.subscribe(filter);
    sub.on("event", (event: NDKEvent) => handleNewEvent(event));
  }, [ndk, activeUser]);

  const handleNewEvent = (event: NDKEvent) => {
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
  }, [fetchCalendarNotifications]);

  const handleAcceptEvent = async (notificationId: string) => {
    // Implementation to update calendar event
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  };

  return (
    <Box>
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
        <Badge badgeContent={notifications.filter((n) => !n.read).length} color="error">
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
            />
          ))}
        </Box>
      </Popover>
    </Box>
  );
}

const NotificationCard = ({
  notification,
  onAccept,
}: {
  notification: Notification;
  onAccept: (id: string) => void;
}) => {
  const metadata = getEventMetadata(notification.event);
  return (
    <Card sx={{ mb: 2 }}>
      <CardHeader
        title={metadata.title || "New Event"}
        subheader={<EventTimeDisplay startTime={metadata.start} />}
      />
      <CardContent>
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
        <Button size="small">Dismiss</Button>
      </CardActions>
    </Card>
  );
};
