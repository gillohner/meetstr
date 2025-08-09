// src/components/common/calendar/AddEventToCalendarButton.tsx
import { useState } from "react";
import {
  Button,
  Menu,
  MenuItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  CalendarMonth as CalendarIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { authService } from "@/services/authService";
import { useNdk } from "nostr-hooks";
import { useActiveUser } from "@/hooks/useActiveUser";
import { NDKEvent, type NDKFilter } from "@nostr-dev-kit/ndk";
import { useEffect } from "react";

interface AddEventToCalendarButtonProps {
  event: {
    id: string;
    kind: number;
    pubkey: string;
    tags: string[][];
  };
}

export default function AddEventToCalendarButton({
  event,
}: AddEventToCalendarButtonProps) {
  const { t } = useTranslation();
  const { ndk } = useNdk();
  const activeUser = useActiveUser();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [loading, setLoading] = useState(false);
  const [calendars, setCalendars] = useState<NDKEvent[]>([]);

  // Fetch user's calendars
  useEffect(() => {
    if (!ndk || !activeUser) return;

    const fetchCalendars = async () => {
      const filter: NDKFilter = {
        kinds: [31924 as any],
        authors: [activeUser.pubkey],
      };
      const events = await ndk.fetchEvents(filter);
      setCalendars(Array.from(events.values()));
    };

    fetchCalendars();
  }, [ndk, activeUser]);

  const handleAddToCalendar = async (calendar: NDKEvent) => {
    try {
      setLoading(true);

      // Always require authentication before proceeding
      await authService.authenticate();

      // Get event coordinates
      const dTag = event.tags?.find((t: string[]) => t[0] === "d")?.[1];
      if (!dTag) {
        console.error("Event missing d tag");
        return;
      }

      const eventCoordinate = `${event.kind}:${event.pubkey}:${dTag}`;

      // Check if already in calendar
      if (calendar.tags.some((t) => t[0] === "a" && t[1] === eventCoordinate)) {
        console.log("Event already in calendar");
        return;
      }

      // Update calendar with new event
      const unsignedCalendar = {
        kind: 31924,
        tags: [...calendar.tags, ["a", eventCoordinate]],
        content: calendar.content || "",
        created_at: Math.floor(Date.now() / 1000),
        pubkey: activeUser!.pubkey,
      };

      // Sign with authService
      const signedCalendar = await authService.signEvent(unsignedCalendar);

      // Convert to NDKEvent for publishing
      const ndkCalendar = new NDKEvent(ndk!, signedCalendar);
      await ndkCalendar.publish();

      console.log("Event added to calendar successfully");
    } catch (error) {
      console.error("Error adding event to calendar:", error);
    } finally {
      setLoading(false);
      setAnchorEl(null);
    }
  };

  const handleButtonClick = async (e: React.MouseEvent<HTMLElement>) => {
    // Always require authentication to show calendars
    try {
      await authService.authenticate();
      setAnchorEl(e.currentTarget);
    } catch (error) {
      console.log("Authentication cancelled");
    }
  };
  const getCalendarTitle = (calendar: NDKEvent) => {
    const titleTag = calendar.tags.find((t) => t[0] === "title");
    const dTag = calendar.tags.find((t) => t[0] === "d");
    return titleTag?.[1] || dTag?.[1] || "Untitled Calendar";
  };

  return (
    <>
      <Tooltip title={t("calendar.addEvent", "Add to Calendar")}>
        <Button
          variant="outlined"
          startIcon={loading ? <CircularProgress size={16} /> : <AddIcon />}
          onClick={handleButtonClick}
          disabled={loading}
        >
          {t("calendar.addToCalendar", "Add to Calendar")}
        </Button>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        {calendars.length === 0 ? (
          <MenuItem disabled>
            <ListItemText
              primary={t("calendar.noCalendars", "No calendars found")}
            />
          </MenuItem>
        ) : (
          calendars.map((calendar) => (
            <MenuItem
              key={calendar.id}
              onClick={() => handleAddToCalendar(calendar)}
              disabled={loading}
            >
              <ListItemIcon>
                <CalendarIcon />
              </ListItemIcon>
              <ListItemText primary={getCalendarTitle(calendar)} />
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
}
