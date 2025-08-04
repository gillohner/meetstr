// src/components/common/events/EventRsvpMenu.tsx

import * as React from "react";
import { styled, alpha } from "@mui/material/styles";
import {
  Button,
  CircularProgress,
  Menu,
  MenuItem,
  type MenuProps,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import CloseIcon from "@mui/icons-material/Close";
import RsvpIcon from "@mui/icons-material/Rsvp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslation } from "react-i18next";
import { useActiveUser } from "@/hooks/useActiveUser";
import { useRsvpHandler, type RsvpStatus } from "@/hooks/useRsvpHandler";
import { type NDKEvent } from "@nostr-dev-kit/ndk";

// Keep the styled menu component as is...
const StyledRsvpMenu = styled((props: MenuProps) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: "bottom",
      horizontal: "right",
    }}
    transformOrigin={{
      vertical: "top",
      horizontal: "right",
    }}
    {...props}
  />
))(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: 6,
    marginTop: theme.spacing(1),
    minWidth: 180,
    boxShadow:
      "rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px",
    "& .MuiMenu-list": {
      padding: 0,
    },
    "& .MuiMenuItem-root": {
      padding: theme.spacing(1.5, 2),
      "& .MuiSvgIcon-root": {
        fontSize: 20,
        marginRight: theme.spacing(1.5),
      },
    },
  },
}));

export default function EventRsvpMenu({ event }: { event: NDKEvent }) {
  const { t } = useTranslation();
  const activeUser = useActiveUser();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // Use our new hook
  const { rsvpStatus, loading, createRsvp, deleteRsvp } = useRsvpHandler(event);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Handle RSVP status changes
  const handleRsvp = (status: RsvpStatus) => {
    createRsvp(status);
    handleClose();
  };

  // Handle RSVP deletion
  const handleDelete = () => {
    deleteRsvp();
    handleClose();
  };

  // Determine button text and color based on current RSVP status
  const getButtonProps = () => {
    if (loading) {
      return {
        color: "primary" as const,
        startIcon: <CircularProgress size={18} />,
      };
    }

    switch (rsvpStatus) {
      case "accepted":
        return {
          color: "success" as const,
          startIcon: <CheckIcon />,
        };
      case "tentative":
        return {
          color: "warning" as const,
          startIcon: <HelpOutlineIcon />,
        };
      case "declined":
        return {
          color: "error" as const,
          startIcon: <CloseIcon />,
        };
      default:
        return {
          color: "primary" as const,
          startIcon: <RsvpIcon />,
        };
    }
  };

  const buttonProps = getButtonProps();

  if (activeUser === undefined) return <CircularProgress size={24} />;
  if (activeUser === null) return null; // Could add login button here

  return (
    <>
      <Button
        variant="contained"
        color={buttonProps.color}
        size="large"
        onClick={handleClick}
        endIcon={<KeyboardArrowDownIcon />}
        startIcon={buttonProps.startIcon}
        disabled={loading}
        sx={{ width: "100%" }}
      >
        {buttonProps.text}
      </Button>
      <StyledRsvpMenu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem
          onClick={() => handleRsvp("accepted")}
          disabled={loading}
          sx={(theme) => ({
            backgroundColor: alpha(theme.palette.success.main, 0.1),
            color: theme.palette.success.dark,
            "&:hover": {
              backgroundColor: alpha(theme.palette.success.main, 0.2),
            },
          })}
        >
          <CheckIcon />
          {t("event.rsvp.accept")}
        </MenuItem>
        <MenuItem
          onClick={() => handleRsvp("tentative")}
          disabled={loading}
          sx={(theme) => ({
            backgroundColor: alpha(theme.palette.warning.main, 0.1),
            color: theme.palette.warning.dark,
            "&:hover": {
              backgroundColor: alpha(theme.palette.warning.main, 0.2),
            },
          })}
        >
          <HelpOutlineIcon />
          {t("event.rsvp.tentative")}
        </MenuItem>
        <MenuItem
          onClick={() => handleRsvp("declined")}
          disabled={loading}
          sx={(theme) => ({
            backgroundColor: alpha(theme.palette.error.main, 0.1),
            color: theme.palette.error.dark,
            "&:hover": {
              backgroundColor: alpha(theme.palette.error.main, 0.2),
            },
          })}
        >
          <CloseIcon />
          {t("event.rsvp.decline")}
        </MenuItem>

        {/* Add delete option when user has already RSVP'd */}
        {rsvpStatus && (
          <MenuItem
            key="delete"
            onClick={handleDelete}
            disabled={loading}
            sx={(theme) => ({
              borderTop: `1px solid ${theme.palette.divider}`,
              backgroundColor: alpha(theme.palette.grey[500], 0.1),
              color: theme.palette.text.primary,
              "&:hover": {
                backgroundColor: alpha(theme.palette.grey[500], 0.2),
              },
            })}
          >
            <DeleteIcon />
            {t("event.rsvp.withdraw")}
          </MenuItem>
        )}
      </StyledRsvpMenu>
    </>
  );
}
