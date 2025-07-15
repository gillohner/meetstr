import * as React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import LinkIcon from "@mui/icons-material/Link";
import DownloadIcon from "@mui/icons-material/Download";
import { useSnackbar } from "@/context/SnackbarContext";
import { getEventNip19Encoding } from "@/utils/nostr/nostrUtils";
import type { NDKEvent } from "@nostr-dev-kit/ndk";

interface AddToCalendarButtonProps {
  calendarEvent?: NDKEvent;
  sx?: any;
}

export default function AddToCalendarButton({
  calendarEvent,
  sx,
}: AddToCalendarButtonProps) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSubscribe = () => {
    if (!calendarEvent) return;
    
    const calendarId = getEventNip19Encoding(calendarEvent);
    const subscriptionUrl = `webcal://${window.location.host}/api/calendar/${calendarId}/ics`;
    
    // Try to open the subscription URL
    window.location.href = subscriptionUrl;
    showSnackbar(t("calendar.subscription.added", "Calendar subscription added"), "success");
    handleClose();
  };

  const handleDownload = () => {
    if (!calendarEvent) return;
    
    const calendarId = getEventNip19Encoding(calendarEvent);
    const downloadUrl = `${window.location.origin}/api/calendar/${calendarId}/ics`;
    
    // Create a temporary link to download the file
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${calendarEvent.tags.find(t => t[0] === 'title')?.[1] || 'meetstr-calendar'}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showSnackbar(t("calendar.download.success", "Calendar downloaded"), "success");
    handleClose();
  };

  const handleCopyLink = async () => {
    if (!calendarEvent) return;
    
    const calendarId = getEventNip19Encoding(calendarEvent);
    const subscriptionUrl = `webcal://${window.location.host}/api/calendar/${calendarId}/ics`;
    
    try {
      await navigator.clipboard.writeText(subscriptionUrl);
      showSnackbar(t("calendar.link.copied", "Subscription link copied"), "success");
    } catch (error) {
      showSnackbar(t("calendar.link.error", "Failed to copy link"), "error");
    }
    handleClose();
  };

  if (!calendarEvent) return null;

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<CalendarTodayIcon />}
        onClick={handleClick}
        sx={sx}
      >
        {t("calendar.addToCalendar", "Add to Calendar")}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <MenuItem onClick={handleSubscribe}>
          <ListItemIcon>
            <CalendarTodayIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText 
            primary={t("calendar.subscribe", "Subscribe to Calendar")}
            secondary={t("calendar.subscribe.desc", "Auto-updates with new events")}
          />
        </MenuItem>
        <MenuItem onClick={handleDownload}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText 
            primary={t("calendar.download", "Download Calendar")}
            secondary={t("calendar.download.desc", "One-time file download")}
          />
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleCopyLink}>
          <ListItemIcon>
            <LinkIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t("calendar.copyLink", "Copy Subscription Link")} />
        </MenuItem>
      </Menu>
    </>
  );
}
