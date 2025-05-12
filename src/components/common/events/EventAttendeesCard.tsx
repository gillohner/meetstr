// src/components/common/events/EventAttendeesCard.tsx
import { AvatarGroup, Avatar, Tooltip, Card, CardContent, Typography, Box } from "@mui/material";
import { useProfile } from "nostr-hooks";
import { nip19 } from "nostr-tools";
import { useMemo, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNdk } from "nostr-hooks";
import type { NDKFilter } from "@nostr-dev-kit/ndk";

interface Participant {
  pubkey: string;
  relay?: string;
  role?: string;
}

interface EventAttendeesCardProps {
  participants: Participant[];
  event: any; // The calendar event object
}

const EventAttendeesCard = ({ participants, event }: EventAttendeesCardProps) => {
  const { t } = useTranslation();
  const { ndk } = useNdk();
  const [rsvpParticipants, setRsvpParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  // Get event coordinates for a tag filtering
  const eventCoordinates = useMemo(() => {
    if (!event) return null;

    const dTag = event.tags.find((t: string[]) => t[0] === "d");
    const dValue = dTag ? dTag[1] : "";

    return `${event.kind}:${event.pubkey}:${dValue}`;
  }, [event]);

  // Fetch RSVPs using NDK directly
  useEffect(() => {
    if (!ndk || !event?.id) return;

    const filters: NDKFilter[] = [];
    const decodedEventId = event.id.startsWith("note1")
      ? nip19.decode(event.id).data.toString()
      : event.id;

    // Add filter for e tag references
    filters.push({
      kinds: [31925],
      "#e": [decodedEventId],
    });

    // Add filter for a tag references if available
    if (eventCoordinates) {
      filters.push({
        kinds: [31925],
        "#a": [eventCoordinates],
      });
    }

    const sub = ndk.subscribe(filters, { closeOnEose: false });
    const timeout = setTimeout(() => setLoading(false), 2000);

    sub.on("event", (rsvpEvent) => {
      setRsvpParticipants((prev) => [
        ...prev,
        {
          pubkey: rsvpEvent.pubkey,
          relay: rsvpEvent.relay?.url,
          role: "rsvp",
        },
      ]);
    });

    return () => {
      sub.stop();
      clearTimeout(timeout);
    };
  }, [ndk, event?.id, eventCoordinates]);

  // Combine and deduplicate participants
  const allParticipants = useMemo(() => {
    const participantMap = new Map<string, Participant>();

    participants.forEach((p) => participantMap.set(p.pubkey, p));
    rsvpParticipants.forEach((p) => {
      if (!participantMap.has(p.pubkey)) {
        participantMap.set(p.pubkey, p);
      }
    });

    return Array.from(participantMap.values());
  }, [participants, rsvpParticipants]);

  return (
    <Card elevation={3} sx={{ mt: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          {t("event.attendees")} {loading ? "" : `(${allParticipants.length})`}
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-start", // aligns children (AvatarGroup) to the left
            width: "100%",
          }}
        >
          <AvatarGroup
            sx={{
              gap: 1.2,
              flexWrap: "wrap",
            }}
          >
            {allParticipants.map((participant) => (
              <ParticipantAvatar key={participant.pubkey} pubkey={participant.pubkey} />
            ))}
          </AvatarGroup>
        </Box>
      </CardContent>
    </Card>
  );
};

const ParticipantAvatar = ({ pubkey }: { pubkey: string }) => {
  const { profile, isLoading } = useProfile({ pubkey });
  const npub = useMemo(() => nip19.npubEncode(pubkey), [pubkey]);

  const handleClick = () => {
    window.open(`https://njump.me/${npub}`, "_blank");
  };

  if (isLoading) {
    return <Avatar sx={{ bgcolor: "grey.300" }} />;
  }

  return (
    <Tooltip title={profile?.displayName || npub}>
      <Avatar
        src={profile?.image}
        onClick={handleClick}
        sx={{
          cursor: "pointer",
          transition: "transform 0.2s",
          "&:hover": { transform: "scale(1.15)" },
        }}
      >
        {!profile?.image && (profile?.displayName?.[0]?.toUpperCase() || npub.slice(0, 2))}
      </Avatar>
    </Tooltip>
  );
};

export default EventAttendeesCard;
