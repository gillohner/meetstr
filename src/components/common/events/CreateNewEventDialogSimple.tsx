// src/components/common/events/CreateNewEventDialog.tsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  Box,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { useActiveUser } from "@/hooks/useActiveUser";
import { useEffect } from "react";

interface CreateNewEventDialogProps {
  open: boolean;
  onClose: () => void;
  calendarEvent?: any;
}

export default function CreateNewEventDialog({
  open,
  onClose,
  calendarEvent,
}: CreateNewEventDialogProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const activeUser = useActiveUser();

  // Check authentication when dialog opens
  useEffect(() => {
    if (open && !activeUser) {
      // If dialog is opened but user is not authenticated, close it
      onClose();
    }
  }, [open, activeUser, onClose]);

  const handleCreateTimeEvent = () => {
    router.push("/create-time-event");
    onClose();
  };

  const handleCreateDateEvent = () => {
    router.push("/create-date-event");
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">
          {t("event.createEvent.title", "Create Event")}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, py: 2 }}>
          <Button
            variant="outlined"
            size="large"
            onClick={handleCreateTimeEvent}
            sx={{ py: 2 }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              <Typography variant="h6">
                {t("event.createEvent.timeEvent", "Time Event")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t(
                  "event.createEvent.timeEventDesc",
                  "Event with specific time and duration"
                )}
              </Typography>
            </Box>
          </Button>

          <Button
            variant="outlined"
            size="large"
            onClick={handleCreateDateEvent}
            sx={{ py: 2 }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              <Typography variant="h6">
                {t("event.createEvent.dateEvent", "Date Event")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t(
                  "event.createEvent.dateEventDesc",
                  "All-day or multi-day event"
                )}
              </Typography>
            </Box>
          </Button>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>{t("common.cancel", "Cancel")}</Button>
      </DialogActions>
    </Dialog>
  );
}
