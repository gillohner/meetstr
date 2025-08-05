// src/components/calendar/CoHostDisplay.tsx
"use client";
import React from "react";
import {
  Box,
  Typography,
  Avatar,
  AvatarGroup,
  Tooltip,
  Chip,
} from "@mui/material";
import { useProfile } from "nostr-hooks";
import { nip19 } from "nostr-tools";
import type { NDKEvent } from "@nostr-dev-kit/ndk";

interface CoHost {
  pubkey: string;
  permissions: string[];
}

interface CoHostDisplayProps {
  calendarEvent: NDKEvent;
  variant?: "compact" | "full";
}

const CoHostAvatar: React.FC<{ pubkey: string; permissions: string[] }> = ({
  pubkey,
  permissions,
}) => {
  const { profile } = useProfile({ pubkey });
  const npub = nip19.npubEncode(pubkey);

  return (
    <Tooltip
      title={
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {profile?.displayName || `${npub.slice(0, 16)}...`}
          </Typography>
          <Typography variant="caption">
            Permissions: {permissions.join(", ")}
          </Typography>
        </Box>
      }
    >
      <Avatar
        src={profile?.image}
        sx={{
          width: 32,
          height: 32,
          cursor: "pointer",
          border: "2px solid",
          borderColor: "primary.main",
        }}
        onClick={() => window.open(`https://njump.me/${npub}`, "_blank")}
      >
        {profile?.displayName?.[0]?.toUpperCase() ||
          npub.slice(4, 6).toUpperCase()}
      </Avatar>
    </Tooltip>
  );
};

const CoHostCard: React.FC<{ coHost: CoHost }> = ({ coHost }) => {
  const { profile } = useProfile({ pubkey: coHost.pubkey });
  const npub = nip19.npubEncode(coHost.pubkey);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        p: 1,
        border: 1,
        borderColor: "divider",
        borderRadius: 1,
        minWidth: 200,
      }}
    >
      <Avatar
        src={profile?.image}
        sx={{ width: 32, height: 32, cursor: "pointer" }}
        onClick={() => window.open(`https://njump.me/${npub}`, "_blank")}
      >
        {profile?.displayName?.[0]?.toUpperCase() ||
          npub.slice(4, 6).toUpperCase()}
      </Avatar>
      <Box sx={{ flex: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {profile?.displayName || `${npub.slice(0, 16)}...`}
        </Typography>
        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
          {coHost.permissions.map((permission) => (
            <Chip
              key={permission}
              label={permission}
              size="small"
              variant="outlined"
              color="primary"
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

const CoHostDisplay: React.FC<CoHostDisplayProps> = ({
  calendarEvent,
  variant = "compact",
}) => {
  // Extract co-hosts from calendar tags
  const coHostTags = calendarEvent.tags.filter(
    (tag) => tag[0] === "p" && tag[3] === "co-host"
  );

  if (coHostTags.length === 0) {
    return null;
  }

  const coHosts: CoHost[] = coHostTags.map((tag) => ({
    pubkey: tag[1],
    permissions: tag[4] ? tag[4].split(",") : ["create"],
  }));

  if (variant === "compact") {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Co-hosts:
        </Typography>
        <AvatarGroup
          max={3}
          sx={{ "& .MuiAvatar-root": { width: 24, height: 24 } }}
        >
          {coHosts.map((coHost) => (
            <CoHostAvatar
              key={coHost.pubkey}
              pubkey={coHost.pubkey}
              permissions={coHost.permissions}
            />
          ))}
        </AvatarGroup>
        {coHosts.length > 3 && (
          <Typography variant="caption" color="text.secondary">
            +{coHosts.length - 3} more
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Co-Hosts ({coHosts.length})
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        {coHosts.map((coHost) => {
          const { profile } = useProfile({ pubkey: coHost.pubkey });
          const npub = nip19.npubEncode(coHost.pubkey);

          return (
            <Box
              key={coHost.pubkey}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                p: 1,
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
                minWidth: 200,
              }}
            >
              <Avatar
                src={profile?.image}
                sx={{ width: 32, height: 32 }}
                onClick={() =>
                  window.open(`https://njump.me/${npub}`, "_blank")
                }
              >
                {profile?.displayName?.[0]?.toUpperCase() ||
                  npub.slice(4, 6).toUpperCase()}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {profile?.displayName || `${npub.slice(0, 16)}...`}
                </Typography>
                <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                  {coHost.permissions.map((permission) => (
                    <Chip
                      key={permission}
                      label={permission}
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default CoHostDisplay;
