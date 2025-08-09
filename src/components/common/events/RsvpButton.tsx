// src/components/common/events/RsvpButton.tsx
import { useState } from "react";
import {
  Button,
  ButtonGroup,
  Menu,
  MenuItem,
  CircularProgress,
  Tooltip,
  Box,
} from "@mui/material";
import {
  CheckCircle as AcceptIcon,
  Cancel as DeclineIcon,
  Help as TentativeIcon,
  ExpandMore as ExpandIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { authService } from "@/services/authService";
import { useRsvpHandler, type RsvpStatus } from "@/hooks/useRsvpHandler";

interface RsvpButtonProps {
  event: {
    id: string;
    kind: number;
    pubkey: string;
    tags: string[][];
  };
}

export default function RsvpButton({ event }: RsvpButtonProps) {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { rsvpStatus, loading, createRsvp } = useRsvpHandler(event);

  const handleRsvp = async (status: RsvpStatus) => {
    try {
      // Always require authentication before proceeding
      await authService.authenticate();
      // Proceed with RSVP only if authentication successful
      await createRsvp(status);
    } catch (error) {
      console.log("Authentication cancelled or failed");
    }
    setAnchorEl(null);
  };

  const getStatusColor = (status: RsvpStatus) => {
    switch (status) {
      case "accepted":
        return "success";
      case "declined":
        return "error";
      case "tentative":
        return "warning";
      default:
        return "primary";
    }
  };

  const getStatusText = (status: RsvpStatus) => {
    switch (status) {
      case "accepted":
        return t("event.rsvp.going", "Going");
      case "declined":
        return t("event.rsvp.notGoing", "Not Going");
      case "tentative":
        return t("event.rsvp.maybe", "Maybe");
      default:
        return t("event.rsvp.rsvp", "RSVP");
    }
  };

  const getStatusIcon = (status: RsvpStatus) => {
    switch (status) {
      case "accepted":
        return <AcceptIcon />;
      case "declined":
        return <DeclineIcon />;
      case "tentative":
        return <TentativeIcon />;
      default:
        return null;
    }
  };

  return (
    <Box>
      <Tooltip title={t("event.rsvp.tooltip", "Click to RSVP for this event")}>
        <ButtonGroup
          variant="contained"
          color={getStatusColor(rsvpStatus) as any}
        >
          <Button
            onClick={() => setAnchorEl(null)}
            disabled={loading}
            startIcon={
              loading ? (
                <CircularProgress size={16} />
              ) : (
                getStatusIcon(rsvpStatus)
              )
            }
            sx={{ minWidth: 120 }}
          >
            {getStatusText(rsvpStatus)}
          </Button>
          <Button
            size="small"
            onClick={(e) => setAnchorEl(e.currentTarget)}
            disabled={loading}
            sx={{ px: 1 }}
          >
            <ExpandIcon />
          </Button>
        </ButtonGroup>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem
          onClick={() => handleRsvp("accepted")}
          disabled={loading || rsvpStatus === "accepted"}
        >
          <AcceptIcon color="success" sx={{ mr: 1 }} />
          {t("event.rsvp.going", "Going")}
        </MenuItem>
        <MenuItem
          onClick={() => handleRsvp("tentative")}
          disabled={loading || rsvpStatus === "tentative"}
        >
          <TentativeIcon color="warning" sx={{ mr: 1 }} />
          {t("event.rsvp.maybe", "Maybe")}
        </MenuItem>
        <MenuItem
          onClick={() => handleRsvp("declined")}
          disabled={loading || rsvpStatus === "declined"}
        >
          <DeclineIcon color="error" sx={{ mr: 1 }} />
          {t("event.rsvp.notGoing", "Not Going")}
        </MenuItem>
      </Menu>
    </Box>
  );
}
