// src/components/common/layout/DefaultFloatingActionButton.tsx
"use client";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EventIcon from "@mui/icons-material/Event";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CreateNewEventDialog from "@/components/common/events/CreateNewEventDialog";
import CreateCalendarForm from "@/components/NostrEventCreation/CreateCalendarForm";
import { useActiveUser } from "@/hooks/useActiveUser";

const DefaultFloatingActionButton: React.FC = () => {
  const { t } = useTranslation();
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

  const handleEventCreate = () => {
    setEventDialogOpen(true);
    setOpen(false);
  };

  const handleCalendarCreate = () => {
    setCalendarDialogOpen(true);
    setOpen(false);
  };

  // Don't render on server to prevent hydration mismatch
  if (!isClient || !activeUser) {
    return null;
  }

  const actions = [
    {
      icon: <EventIcon />,
      name: t("event.createEvent.title", "Create Event"),
      onClick: handleEventCreate,
    },
    {
      icon: <CalendarMonthIcon />,
      name: t("createCalendar.title", "Create Calendar"),
      onClick: handleCalendarCreate,
    },
  ];

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
      />

      <CreateCalendarForm
        open={calendarDialogOpen}
        onClose={() => setCalendarDialogOpen(false)}
      />
    </>
  );
};

export default DefaultFloatingActionButton;
