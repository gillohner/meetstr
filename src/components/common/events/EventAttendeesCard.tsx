// src/components/common/events/EventAttendeesCard.tsx
import {
  AvatarGroup,
  Avatar,
  Tooltip,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Stack,
} from "@mui/material";
import { useProfile } from "nostr-hooks";
import { nip19 } from "nostr-tools";
import { useMemo, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNdk } from "nostr-hooks";
import type { NDKFilter } from "@nostr-dev-kit/ndk";

interface Participant {
  pubkey: string;
  relay?: string;
  status?: "accepted" | "tentative" | "declined";
}

interface EventAttendeesCardProps {
  participants: Participant[];
  event: any;
}

const EventAttendeesCard = ({
  participants,
  event,
}: EventAttendeesCardProps) => {
  const { t } = useTranslation();
  const { ndk } = useNdk();
  const [rsvpAccepted, setRsvpAccepted] = useState<Participant[]>([]);
  const [rsvpTentative, setRsvpTentative] = useState<Participant[]>([]);
  const [rsvpDeclined, setRsvpDeclined] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  const eventCoordinates = useMemo(() => {
    if (!event) return null;
    const dTag = event.tags.find((t: string[]) => t[0] === "d");
    return dTag ? `${event.kind}:${event.pubkey}:${dTag[1]}` : null;
  }, [event]);

  useEffect(() => {
    if (!ndk || !event?.id) return;

    const filters: NDKFilter[] = [
      {
        // @ts-ignore
        kinds: [31925],
        "#e": [event.id],
      },
    ];

    if (eventCoordinates) {
      filters.push({
        // @ts-ignore
        kinds: [31925],
        "#a": [eventCoordinates],
      });
    }

    const sub = ndk.subscribe(filters, { closeOnEose: false });
    const timeout = setTimeout(() => setLoading(false), 2000);

    sub.on("event", (rsvpEvent) => {
      const statusTag = rsvpEvent.tags.find((t: string[]) => t[0] === "status");
      const status = statusTag?.[1] as Participant["status"];
      const participant = {
        pubkey: rsvpEvent.pubkey,
        relay: rsvpEvent.relay?.url,
        status: status || "accepted",
      };

      setRsvpAccepted((prev) =>
        updateParticipants(prev, participant, "accepted")
      );
      setRsvpTentative((prev) =>
        updateParticipants(prev, participant, "tentative")
      );
      setRsvpDeclined((prev) =>
        updateParticipants(prev, participant, "declined")
      );
    });

    return () => {
      sub.stop();
      clearTimeout(timeout);
    };
  }, [ndk, event?.id, eventCoordinates]);

  const updateParticipants = (
    existing: Participant[],
    newPart: Participant,
    status: string
  ) => {
    const filtered = existing.filter((p) => p.pubkey !== newPart.pubkey);
    return newPart.status === status ? [...filtered, newPart] : filtered;
  };

  const categorizedParticipants = useMemo(
    () => ({
      accepted: [...participants.filter((p) => !p.status), ...rsvpAccepted],
      tentative: rsvpTentative,
      declined: rsvpDeclined,
    }),
    [participants, rsvpAccepted, rsvpTentative, rsvpDeclined]
  );

  const totalAttendees = useMemo(
    () =>
      categorizedParticipants.accepted.length +
      categorizedParticipants.tentative.length,
    [categorizedParticipants]
  );

  return (
    <Card elevation={3} sx={{ mt: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          {t("event.attendees")} {loading ? "" : `(${totalAttendees})`}
        </Typography>

        <Stack spacing={3}>
          <AttendanceCategory
            title={t("event.rsvp.accepted")}
            participants={categorizedParticipants.accepted}
            loading={loading}
            color="success"
          />

          <AttendanceCategory
            title={t("event.rsvp.tentative")}
            participants={categorizedParticipants.tentative}
            loading={loading}
            color="warning"
          />

          <AttendanceCategory
            title={t("event.rsvp.declined")}
            participants={categorizedParticipants.declined}
            loading={loading}
            color="error"
          />
        </Stack>
      </CardContent>
    </Card>
  );
};

const AttendanceCategory = ({ title, participants, loading, color }: any) => (
  <Box sx={{ display: "flex", justifyContent: "flex-start", flexWrap: "wrap" }}>
    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
      <Chip label={title} size="small" color={color} />
      {!loading && (
        <Typography variant="caption">({participants.length})</Typography>
      )}
    </Stack>

    <AvatarGroup sx={{ gap: 1.2 }}>
      {participants.map((p: Participant) => (
        <ParticipantAvatar key={p.pubkey} pubkey={p.pubkey} status={p.status} />
      ))}
    </AvatarGroup>
  </Box>
);

const ParticipantAvatar = ({
  pubkey,
  status,
}: {
  pubkey: string;
  status?: string;
}) => {
  const { profile } = useProfile({ pubkey });
  const npub = useMemo(() => nip19.npubEncode(pubkey), [pubkey]);

  return (
    <Tooltip title={profile?.displayName || npub}>
      <Avatar
        src={profile?.image}
        sx={{
          cursor: "pointer",
          transition: "transform 0.2s",
          border: (theme) =>
            status
              ? `2px solid ${
                  theme.palette[
                    status === "accepted"
                      ? "success"
                      : status === "tentative"
                        ? "warning"
                        : "error"
                  ].main
                }`
              : "none",
          "&:hover": { transform: "scale(1.15)" },
        }}
        onClick={() => window.open(`https://njump.me/${npub}`, "_blank")}
      >
        {profile &&
          !profile?.image &&
          (profile?.displayName?.[0]?.toUpperCase() || npub.slice(0, 2))}
      </Avatar>
    </Tooltip>
  );
};

export default EventAttendeesCard;
