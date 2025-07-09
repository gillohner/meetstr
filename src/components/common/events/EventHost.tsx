// src/components/common/events/EventHost.tsx
import { Box, Avatar, Typography } from "@mui/material";
import { useProfile } from "nostr-hooks";
import { nip19 } from "nostr-tools";
import { useMemo } from "react";

interface EventHostProps {
  hostPubkey?: string | null;
}

export default function EventHost({ hostPubkey }: EventHostProps) {
  if (!hostPubkey) return null;
  const { profile } = useProfile({ pubkey: hostPubkey });
  const npub = useMemo(() => nip19.npubEncode(hostPubkey), [hostPubkey]);

  return (
    <Box sx={{ display: "flex", mb: 2 }}>
      {hostPubkey && (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Avatar
            src={profile?.image}
            sx={{ width: 24, height: 24, cursor: "pointer" }}
            onClick={() => window.open(`https://njump.me/${npub}`, "_blank")}
          >
            {profile?.displayName?.[0]?.toUpperCase() || npub.slice(0, 2)}
          </Avatar>

          <Box sx={{ flex: 1 }}>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}
            >
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ whiteSpace: "pre-line" }}
              >
                {" "}
                {profile?.displayName || npub.slice(0, 8) + "..."}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}
