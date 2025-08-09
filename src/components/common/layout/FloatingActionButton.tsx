"use client";
// src/components/common/layout/FloatingActionButton.tsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { usePathname } from "next/navigation";
import {
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EventIcon from "@mui/icons-material/Event";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import EditIcon from "@mui/icons-material/Edit";
import CreateNewEventDialog from "@/components/common/events/CreateNewEventDialog";
import CreateCalendarForm from "@/components/NostrEventCreation/CreateCalendarForm";
import { useActiveUser } from "@/hooks/useActiveUser";
import { authService } from "@/services/authService";

interface FloatingActionButtonProps {
  // Context-specific props
  calendarEvent?: any;
  eventData?: any;
  isOwner?: boolean;
  onEdit?: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  calendarEvent,
  eventData,
  isOwner,
  onEdit,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const pathname = usePathname();
  const activeUser = useActiveUser();
  const [open, setOpen] = useState(false);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [calendarDialogOpen, setCalendarDialogOpen] = useState(false);
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

  const handleEventCreate = async () => {
    setOpen(false); // Close SpeedDial first

    // Add small delay to prevent modal conflicts
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      // Always require authentication before opening the form
      await authService.authenticate();
      // Only open dialog if authentication successful
      setEventDialogOpen(true);
    } catch (error) {
      console.log("User cancelled authentication - form will not open");
    }
  };

  const handleCalendarCreate = async () => {
    setOpen(false); // Close SpeedDial first

    // Add small delay to prevent modal conflicts
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      // Always require authentication before opening the form
      await authService.authenticate();
      // Only open dialog if authentication successful
      setCalendarDialogOpen(true);
    } catch (error) {
      console.log("User cancelled authentication - form will not open");
    }
  };
  const handleEdit = () => {
    if (onEdit) {
      onEdit();
    }
    setOpen(false);
  };

  // Determine actions based on context
  let actions = [];

  // Don't render on server to prevent hydration mismatch
  if (!isClient) {
    return null;
  }

  // Always show general creation options (even when not logged in)
  actions.push({
    icon: <EventIcon />,
    name: calendarEvent
      ? t("event.createEvent.addToCalendar", "Add Event to Calendar")
      : t("event.createEvent.title", "Create Event"),
    onClick: handleEventCreate,
  });

  actions.push({
    icon: <CalendarMonthIcon />,
    name: t("createCalendar.title", "Create Calendar"),
    onClick: handleCalendarCreate,
  });

  // Add edit action if user owns current content (only show when logged in)
  if (activeUser && isOwner && onEdit) {
    if (pathname?.includes("/event/")) {
      actions.unshift({
        icon: <EditIcon />,
        name: t("event.edit.title", "Edit Event"),
        onClick: handleEdit,
      });
    } else if (pathname?.includes("/calendar/")) {
      actions.unshift({
        icon: <EditIcon />,
        name: t("calendar.edit.title", "Edit Calendar"),
        onClick: handleEdit,
      });
    }
  }

  return (
    <>
      <SpeedDial
        ariaLabel="Create new content"
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 1000,
          "& .MuiSpeedDial-fab": {
            backgroundColor: "warning.main",
            color: "warning.contrastText",
            "&:hover": {
              backgroundColor: "warning.dark",
            },
          },
        }}
        icon={<SpeedDialIcon icon={<AddIcon />} />}
        onClose={handleClose}
        onOpen={handleOpen}
        open={open}
        direction="up"
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={action.onClick}
            sx={{
              "& .MuiSpeedDialAction-fab": {
                backgroundColor: "warning.light",
                color: "warning.contrastText",
                "&:hover": {
                  backgroundColor: "warning.main",
                },
              },
            }}
          />
        ))}
      </SpeedDial>

      <CreateNewEventDialog
        open={eventDialogOpen}
        onClose={() => setEventDialogOpen(false)}
        calendarEvent={calendarEvent}
      />

      <CreateCalendarForm
        open={calendarDialogOpen}
        onClose={() => setCalendarDialogOpen(false)}
      />
    </>
  );
};

export default FloatingActionButton;
