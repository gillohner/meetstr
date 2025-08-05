"use client";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Tooltip,
  IconButton,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import SubscriptionsIcon from "@mui/icons-material/Subscriptions";
import LinkIcon from "@mui/icons-material/Link";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { useSnackbar } from "@/context/SnackbarContext";
import { type NDKEvent } from "@nostr-dev-kit/ndk";
import { getEventMetadata } from "@/utils/nostr/eventUtils";

interface AddToCalendarIcsButtonProps {
  calendarEvent: NDKEvent;
}

const AddToCalendarIcsButton: React.FC<AddToCalendarIcsButtonProps> = ({
  calendarEvent,
}) => {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const [open, setOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Prevent hydration mismatch
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const generateWebcalUrl = () => {
    // Generate webcal URL for calendar subscription
    const baseUrl = window.location.origin;
    const calendarId = calendarEvent.id;
    return `webcal://${baseUrl.replace(/^https?:\/\//, "")}/api/calendar/${calendarId}/ics`;
  };

  const generateIcsUrl = () => {
    // Generate ICS download URL
    const baseUrl = window.location.origin;
    const calendarId = calendarEvent.id;
    return `${baseUrl}/api/calendar/${calendarId}/ics`;
  };

  const handleCopyWebcalLink = async () => {
    try {
      const webcalUrl = generateWebcalUrl();
      await navigator.clipboard.writeText(webcalUrl);
      showSnackbar(t("calendar.link.copied"), "success");
      setOpen(false);
    } catch (error) {
      console.error("Error copying webcal link:", error);
      showSnackbar(t("calendar.link.error"), "error");
    }
  };

  const handleSubscribeToCalendar = () => {
    try {
      const webcalUrl = generateWebcalUrl();
      window.open(webcalUrl, "_blank");
      showSnackbar(t("calendar.subscription.added"), "success");
      setOpen(false);
    } catch (error) {
      console.error("Error opening webcal link:", error);
      showSnackbar(t("calendar.link.error"), "error");
    }
  };

  const handleDownloadIcs = () => {
    try {
      const icsUrl = generateIcsUrl();
      const link = document.createElement("a");
      link.href = icsUrl;
      link.download = `${getEventMetadata(calendarEvent).title || "calendar"}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showSnackbar(t("calendar.download.success"), "success");
      setOpen(false);
    } catch (error) {
      console.error("Error downloading ICS:", error);
      showSnackbar(t("calendar.link.error"), "error");
    }
  };

  // Don't render on server to prevent hydration mismatch
  if (!isClient) {
    return null;
  }

  const actions = [
    {
      icon: <SubscriptionsIcon />,
      name: t("calendar.subscribe.text", "Subscribe to Calendar"),
      tooltip: t("calendar.subscribe.desc", "Auto-updates with new events"),
      onClick: handleSubscribeToCalendar,
    },
    {
      icon: <DownloadIcon />,
      name: t("calendar.download.title", "Download Calendar"),
      tooltip: t("calendar.download.desc", "One-time ics download"),
      onClick: handleDownloadIcs,
    },
    {
      icon: <LinkIcon />,
      name: t("calendar.copyLink", "Copy Webcal Link"),
      tooltip: t("calendar.copyLink", "Copy subscription link"),
      onClick: handleCopyWebcalLink,
    },
  ];

  return (
    <SpeedDial
      ariaLabel="Calendar actions"
      sx={{
        position: "relative",
        "& .MuiSpeedDial-fab": {
          backgroundColor: "secondary.main",
          color: "secondary.contrastText",
          width: 40,
          height: 40,
          minHeight: 40,
          borderRadius: "50%",
          "&:hover": {
            backgroundColor: "secondary.dark",
          },
        },
        "& .MuiSpeedDial-actions": {
          position: "absolute",
          zIndex: 1400, // Higher than MUI modal backdrop
        },
      }}
      icon={<SpeedDialIcon icon={<CalendarMonthIcon />} />}
      onClose={handleClose}
      onOpen={handleOpen}
      open={open}
      direction="down"
    >
      {actions.map((action) => (
        <SpeedDialAction
          key={action.name}
          icon={action.icon}
          tooltipTitle={
            <div>
              <div style={{ fontWeight: 600 }}>{action.name}</div>
              <div style={{ fontSize: "0.75rem", opacity: 0.8 }}>
                {action.tooltip}
              </div>
            </div>
          }
          onClick={action.onClick}
          sx={{
            "& .MuiSpeedDialAction-fab": {
              backgroundColor: "secondary.light",
              color: "secondary.contrastText",
              "&:hover": {
                backgroundColor: "secondary.main",
              },
            },
          }}
        />
      ))}
    </SpeedDial>
  );
};

export default AddToCalendarIcsButton;
