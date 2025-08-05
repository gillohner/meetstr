// src/components/calendar/DelegationNotification.tsx
"use client";
import React, { useState, useEffect } from "react";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  CardContent,
  Collapse,
  IconButton,
  Typography,
} from "@mui/material";
import {
  Close as CloseIcon,
  Check as CheckIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { useNdk } from "nostr-hooks";
import { useActiveUser } from "@/hooks/useActiveUser";
import type { NDKFilter } from "@nostr-dev-kit/ndk";

interface DelegationNotificationProps {
  onNotificationRead?: () => void;
}

interface NotificationData {
  id: string;
  calendarId: string;
  calendarName: string;
  delegatorPubkey: string;
  timestamp: number;
  read: boolean;
}

const DelegationNotification: React.FC<DelegationNotificationProps> = ({
  onNotificationRead,
}) => {
  const { ndk } = useNdk();
  const activeUser = useActiveUser();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    if (!ndk || !activeUser) return;

    try {
      // Listen for delegation notifications (DMs with delegation_notification tag)
      const filter: NDKFilter = {
        kinds: [4], // Direct messages
        "#p": [activeUser.pubkey],
        "#delegation_notification": ["co-host-added"],
        since: Math.floor(Date.now() / 1000) - 86400, // Last 24 hours
      };

      const sub = ndk.subscribe(filter);

      sub.on("event", (event) => {
        try {
          const calendarTag = event.tags.find((t) => t[0] === "calendar");
          if (!calendarTag) return;

          const notification: NotificationData = {
            id: event.id,
            calendarId: calendarTag[1],
            calendarName:
              event.content.match(/to "([^"]+)"/)?.[1] || "Unknown Calendar",
            delegatorPubkey: event.pubkey,
            timestamp: event.created_at || 0,
            read: false,
          };

          setNotifications((prev) => {
            const exists = prev.find((n) => n.id === notification.id);
            if (exists) return prev;
            return [notification, ...prev];
          });
        } catch (error) {
          console.error("Error processing delegation notification:", error);
        }
      });

      return () => sub.stop();
    } catch (error) {
      console.error(
        "Error setting up delegation notification subscription:",
        error
      );
    }
  }, [ndk, activeUser]);

  const handleDismiss = (notificationId: string) => {
    setDismissed((prev) => [...prev, notificationId]);
    onNotificationRead?.();
  };

  const handleAcknowledge = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
    handleDismiss(notificationId);
  };

  const visibleNotifications = notifications.filter(
    (n) => !dismissed.includes(n.id) && !n.read
  );

  if (visibleNotifications.length === 0) return null;

  return (
    <Box sx={{ mb: 2 }}>
      {visibleNotifications.map((notification) => (
        <Collapse
          key={notification.id}
          in={!dismissed.includes(notification.id)}
        >
          <Alert
            severity="info"
            icon={<InfoIcon />}
            sx={{ mb: 1 }}
            action={
              <Box>
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => handleAcknowledge(notification.id)}
                  startIcon={<CheckIcon />}
                  sx={{ mr: 1 }}
                >
                  Got it
                </Button>
                <IconButton
                  color="inherit"
                  size="small"
                  onClick={() => handleDismiss(notification.id)}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              </Box>
            }
          >
            <AlertTitle>You've been added as a co-host!</AlertTitle>
            <Typography variant="body2">
              You now have permission to create events in "
              {notification.calendarName}". Your delegation expires in 30 days.
            </Typography>
          </Alert>
        </Collapse>
      ))}
    </Box>
  );
};

export default DelegationNotification;
