// src/components/common/events/EventPreviewCard.tsx
import React from "react";
import { useTranslation } from "react-i18next";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import { useRouter } from "next/navigation";
import { nip19 } from "nostr-tools";
import { Card, CardActionArea, CardContent, CardMedia, Typography, Box } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { getEventMetadata } from "@/utils/nostr/eventUtils";
import EventLocationText from "@/components/common/events/EventLocationText";
import EventTimeDisplay from "@/components/common/events/EventTimeDisplay";
import { formatDate } from "@/utils/formatting/date";

interface EventPreviewCardProps {
  event: NDKEvent;
  sx?: object;
}

const EventPreviewCard: React.FC<EventPreviewCardProps> = ({ event, sx = {} }) => {
  const { t } = useTranslation();
  const router = useRouter();

  const metadata = getEventMetadata(event);
  const name = metadata.title || t("error.event.noName");
  const formattedStartTime = metadata.start
    ? formatDate(metadata.start, t("error.event.invalidDate"))
    : t("error.event.noDate");
  const formattedEndTime = metadata.end
    ? formatDate(metadata.end, t("error.event.invalidDate"))
    : t("error.event.noDate");

  const handleClick = () => {
    try {
      const dTag = event.tags.find((t) => t[0] === "d")?.[1] || "";
      const naddr = nip19.naddrEncode({
        kind: event.kind,
        pubkey: event.pubkey,
        identifier: dTag,
      });
      router.push(`/event/${naddr}`);
    } catch (error) {
      console.error("Error navigating to event:", error);
    }
  };

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: {
          xs: "column", // Mobile vertical layout
          sm: "row", // Desktop horizontal layout
        },
        height: "100%",
        minHeight: 300, // Ensure minimum mobile height
      }}
    >
      <CardActionArea
        onClick={handleClick}
        sx={{
          display: "flex",
          flexDirection: {
            xs: "column", // Stack vertically on mobile
            sm: "row", // Side-by-side on desktop
          },
          height: "100%",
          alignItems: "stretch",
        }}
      >
        <CardMedia
          component="img"
          image={metadata.image}
          alt={name}
          sx={{
            // Image takes full width on mobile, fixed width on desktop
            height: {
              xs: 200, // Fixed height on mobile
              sm: "100%", // Full height on desktop
            },
            width: {
              xs: "100%", // Full width on mobile
              sm: 220, // Fixed width on desktop
            },
            objectFit: "cover",
            borderRadius: {
              xs: "4px 4px 0 0", // Rounded top on mobile
              sm: "4px 0 0 4px", // Rounded left on desktop
            },
          }}
        />
        <CardContent
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "auto",
            minWidth: 0,
            padding: 2,
          }}
        >
          <Typography
            gutterBottom
            variant="h6"
            component="div"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {name}
          </Typography>
          <EventTimeDisplay
            startTime={metadata.start}
            endTime={metadata.end}
            typographyProps={{
              variant: "body2",
              fontSize: 14,
            }}
          />
          <EventLocationText
            location={metadata.location}
            geohash={metadata.geohash}
            typographyProps={{
              variant: "body2",
              fontSize: 14,
            }}
          />
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default EventPreviewCard;
