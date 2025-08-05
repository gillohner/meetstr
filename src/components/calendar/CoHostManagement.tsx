// src/components/calendar/CoHostManagement.tsx
"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Box,
  Chip,
  FormControlLabel,
  Checkbox,
  Divider,
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useNdk } from "nostr-hooks";
import { useActiveUser } from "@/hooks/useActiveUser";
import { useSnackbar } from "@/context/SnackbarContext";
import { nip19 } from "nostr-tools";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import {
  createConditionsString,
  type DelegationConditions,
} from "@/utils/nostr/delegation";
import dayjs from "dayjs";
import { useClientLocale } from "@/hooks/useClientLocale";

interface CoHost {
  pubkey: string;
  npub: string;
  permissions: {
    canCreateEvents: boolean;
    canEditEvents: boolean;
    canDeleteEvents: boolean;
  };
  delegationToken?: string;
  conditions?: string;
  expiresAt?: number;
}

interface CoHostManagementProps {
  open: boolean;
  onClose: () => void;
  calendarEvent: NDKEvent;
  onCoHostsUpdated?: () => void;
}

const CoHostManagement: React.FC<CoHostManagementProps> = ({
  open,
  onClose,
  calendarEvent,
  onCoHostsUpdated,
}) => {
  const { t } = useTranslation();
  const { ndk } = useNdk();
  const activeUser = useActiveUser();
  const { showSnackbar } = useSnackbar();
  const { dateFormat } = useClientLocale();

  const [coHosts, setCoHosts] = useState<CoHost[]>([]);
  const [newHostInput, setNewHostInput] = useState("");
  const [newHostPermissions, setNewHostPermissions] = useState({
    canCreateEvents: true,
    canEditEvents: false,
    canDeleteEvents: false,
  });
  const [loading, setLoading] = useState(false);

  // Check if current user is calendar owner
  const isOwner =
    activeUser && calendarEvent && activeUser.pubkey === calendarEvent.pubkey;

  // Load existing co-hosts from calendar tags
  useEffect(() => {
    if (!calendarEvent) return;

    const hostTags = calendarEvent.tags.filter(
      (tag) => tag[0] === "p" && tag[3] === "co-host"
    );
    const loadedHosts: CoHost[] = [];

    hostTags.forEach((tag) => {
      const pubkey = tag[1];
      const npub = nip19.npubEncode(pubkey);

      // Parse permissions from tag
      const permissionsStr = tag[4] || "create";
      const permissions = {
        canCreateEvents: permissionsStr.includes("create"),
        canEditEvents: permissionsStr.includes("edit"),
        canDeleteEvents: permissionsStr.includes("delete"),
      };

      // Look for delegation info in other tags
      const delegationTag = calendarEvent.tags.find(
        (dtag) => dtag[0] === "delegation" && dtag[1] === pubkey
      );

      loadedHosts.push({
        pubkey,
        npub,
        permissions,
        delegationToken: delegationTag?.[3],
        conditions: delegationTag?.[2],
        expiresAt: delegationTag
          ? extractExpirationFromConditions(delegationTag[2])
          : undefined,
      });
    });

    setCoHosts(loadedHosts);
  }, [calendarEvent]);

  const extractExpirationFromConditions = (
    conditions: string
  ): number | undefined => {
    const match = conditions.match(/created_at<(\d+)/);
    return match ? parseInt(match[1]) : undefined;
  };

  const handleAddCoHost = async () => {
    if (!newHostInput.trim() || !isOwner || !window.nostr) return;

    setLoading(true);
    try {
      let pubkey: string;

      // Parse npub or hex pubkey
      if (newHostInput.startsWith("npub")) {
        const decoded = nip19.decode(newHostInput);
        if (decoded.type !== "npub") {
          showSnackbar("Invalid npub format", "error");
          return;
        }
        pubkey = decoded.data;
      } else if (newHostInput.length === 64) {
        pubkey = newHostInput;
      } else {
        showSnackbar(
          "Invalid pubkey format. Please enter a valid npub or 64-character hex pubkey",
          "error"
        );
        return;
      }

      // Check if already exists
      if (coHosts.some((host) => host.pubkey === pubkey)) {
        showSnackbar("Co-host already exists", "warning");
        return;
      }

      // Create delegation conditions (30 days from now)
      const now = Math.floor(Date.now() / 1000);
      const thirtyDaysLater = now + 30 * 24 * 60 * 60;

      const conditions: DelegationConditions = {
        kinds: [31922, 31923], // Event kinds
        createdAtAfter: now,
        createdAtBefore: thirtyDaysLater,
      };

      const conditionsString = createConditionsString(conditions);

      // Sign delegation (this would need the delegator's private key)
      // For now, we'll create the structure without the actual signature
      // In a real implementation, you'd need access to the private key

      const newCoHost: CoHost = {
        pubkey,
        npub: nip19.npubEncode(pubkey),
        permissions: newHostPermissions,
        conditions: conditionsString,
        expiresAt: thirtyDaysLater,
      };

      // Update calendar event with new co-host
      await updateCalendarWithCoHost(newCoHost);

      setCoHosts([...coHosts, newCoHost]);
      setNewHostInput("");
      setNewHostPermissions({
        canCreateEvents: true,
        canEditEvents: false,
        canDeleteEvents: false,
      });

      // This file contains simplified co-host management without NIP-26 delegation
      // Co-hosts are now managed through simple calendar permissions
      // without cryptographic delegation tokens
      export default function CoHostManagement() {
        return null;
      }
    } catch (error) {
      console.error("Error adding co-host:", error);
      showSnackbar("Failed to add co-host", "error");
    } finally {
      setLoading(false);
    }
  };

  const updateCalendarWithCoHost = async (coHost: CoHost) => {
    if (!ndk || !activeUser || !window.nostr) return;

    const dTag = calendarEvent.tags.find((t) => t[0] === "d")?.[1];
    if (!dTag) {
      showSnackbar("Calendar missing d-tag", "error");
      throw new Error("Calendar missing d-tag");
    }

    // Create permissions string
    const permissionsArray = [];
    if (coHost.permissions.canCreateEvents) permissionsArray.push("create");
    if (coHost.permissions.canEditEvents) permissionsArray.push("edit");
    if (coHost.permissions.canDeleteEvents) permissionsArray.push("delete");
    const permissionsStr = permissionsArray.join(",");

    // Create updated calendar event
    const unsignedEvent = {
      kind: 31924,
      content: calendarEvent.content,
      tags: [
        ...calendarEvent.tags,
        ["p", coHost.pubkey, "", "co-host", permissionsStr],
        // Note: In real implementation, you'd add the delegation tag with proper signature
        // ['delegation', coHost.pubkey, coHost.conditions!, coHost.delegationToken!]
      ],
      created_at: Math.floor(Date.now() / 1000),
      pubkey: activeUser.pubkey,
    };

    const signedEvent = await window.nostr.signEvent(unsignedEvent);
    const ndkEvent = new NDKEvent(ndk, signedEvent);
    await ndkEvent.publish();
  };

  const sendDelegationNotification = async (coHost: CoHost) => {
    if (!ndk || !activeUser || !window.nostr) return;

    const calendarName =
      calendarEvent.tags.find((t) => t[0] === "title")?.[1] || "Calendar";

    const notificationContent = `You have been added as a co-host to "${calendarName}" with permissions to create events. This delegation expires in 30 days.`;

    const unsignedEvent = {
      kind: 4, // Direct message
      content: notificationContent,
      tags: [
        ["p", coHost.pubkey],
        ["calendar", calendarEvent.id],
        ["delegation_notification", "co-host-added"],
      ],
      created_at: Math.floor(Date.now() / 1000),
      pubkey: activeUser.pubkey,
    };

    const signedEvent = await window.nostr.signEvent(unsignedEvent);
    const ndkEvent = new NDKEvent(ndk, signedEvent);
    await ndkEvent.publish();
  };

  const handleRemoveCoHost = async (pubkey: string) => {
    if (!isOwner) return;

    try {
      setLoading(true);

      // Remove co-host from calendar
      const updatedTags = calendarEvent.tags.filter(
        (tag) => !(tag[0] === "p" && tag[1] === pubkey && tag[3] === "co-host")
      );

      const unsignedEvent = {
        kind: 31924,
        content: calendarEvent.content,
        tags: updatedTags,
        created_at: Math.floor(Date.now() / 1000),
        pubkey: activeUser!.pubkey,
      };

      const signedEvent = await window.nostr!.signEvent(unsignedEvent);
      const ndkEvent = new NDKEvent(ndk!, signedEvent);
      await ndkEvent.publish();

      setCoHosts(coHosts.filter((host) => host.pubkey !== pubkey));
      showSnackbar("Co-host removed successfully", "success");
    } catch (error) {
      console.error("Error removing co-host:", error);
      showSnackbar("Failed to remove co-host", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOwner) {
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogContent>
          <Alert severity="warning">{t("event.manageCoHosts.ownerOnly")}</Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "background.paper",
          backgroundImage: "none",
        },
      }}
    >
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <PersonIcon sx={{ mr: 1 }} />
            {t("event.manageCoHosts.title")}
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {t("event.manageCoHosts.description")}
        </Typography>

        {/* Add new co-host */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {t("event.manageCoHosts.addNew")}
          </Typography>

          <TextField
            fullWidth
            label={t("event.manageCoHosts.publicKeyLabel")}
            value={newHostInput}
            onChange={(e) => setNewHostInput(e.target.value)}
            placeholder={t("event.manageCoHosts.publicKeyPlaceholder")}
            sx={{ mb: 2 }}
          />

          <Typography variant="subtitle2" gutterBottom>
            {t("event.manageCoHosts.permissions")}
          </Typography>
          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={newHostPermissions.canCreateEvents}
                  onChange={(e) =>
                    setNewHostPermissions({
                      ...newHostPermissions,
                      canCreateEvents: e.target.checked,
                    })
                  }
                />
              }
              label={t("event.manageCoHosts.canCreateEvents")}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={newHostPermissions.canEditEvents}
                  onChange={(e) =>
                    setNewHostPermissions({
                      ...newHostPermissions,
                      canEditEvents: e.target.checked,
                    })
                  }
                />
              }
              label={t("event.manageCoHosts.canEditEvents")}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={newHostPermissions.canDeleteEvents}
                  onChange={(e) =>
                    setNewHostPermissions({
                      ...newHostPermissions,
                      canDeleteEvents: e.target.checked,
                    })
                  }
                />
              }
              label={t("event.manageCoHosts.canDeleteEvents")}
            />
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddCoHost}
            disabled={!newHostInput.trim() || loading}
          >
            {t("event.manageCoHosts.addButton")}
          </Button>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Existing co-hosts */}
        <Typography variant="h6" gutterBottom>
          {t("event.manageCoHosts.currentCoHosts", "Current Co-Hosts")} (
          {coHosts.length})
        </Typography>

        {coHosts.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {t("event.manageCoHosts.noCoHosts")}
          </Typography>
        ) : (
          <List>
            {coHosts.map((coHost) => (
              <ListItem key={coHost.pubkey} divider>
                <ListItemText
                  primary={
                    <Typography variant="body1" component="span">
                      {coHost.npub.slice(0, 16)}...{coHost.npub.slice(-8)}
                      {coHost.expiresAt && (
                        <Chip
                          size="small"
                          label={`${t("event.manageCoHosts.expires")}: ${dayjs.unix(coHost.expiresAt).format(dateFormat)}`}
                          color="info"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Typography>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      {coHost.permissions.canCreateEvents && (
                        <Chip size="small" label="Create" sx={{ mr: 0.5 }} />
                      )}
                      {coHost.permissions.canEditEvents && (
                        <Chip size="small" label="Edit" sx={{ mr: 0.5 }} />
                      )}
                      {coHost.permissions.canDeleteEvents && (
                        <Chip size="small" label="Delete" sx={{ mr: 0.5 }} />
                      )}
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => handleRemoveCoHost(coHost.pubkey)}
                    disabled={loading}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CoHostManagement;
