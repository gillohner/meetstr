// src/components/common/events/EventPreviewCard.tsx
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { type NDKEvent } from "@nostr-dev-kit/ndk";
import Link from "next/link";
import { nip19 } from "nostr-tools";
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
  Skeleton,
  Box,
} from "@mui/material";
import { getEventMetadata } from "@/utils/nostr/eventUtils";
import EventLocationText from "@/components/common/events/EventLocationText";
import EventTimeDisplay from "@/components/common/events/EventTimeDisplay";

interface EventPreviewCardProps {
  event: NDKEvent;
  sx?: object;
}

const EventPreviewCard: React.FC<EventPreviewCardProps> = ({
  event,
  sx = {},
}) => {
  const { t } = useTranslation();
  const metadata = getEventMetadata(event);
  const name = metadata.title || t("error.event.noName", "Untitled Event");

  const eventHref = useMemo(() => {
    try {
      const dTag = event.tags.find((t) => t[0] === "d")?.[1] || "";
      const naddr = nip19.naddrEncode({
        kind: event.kind,
        pubkey: event.pubkey,
        identifier: dTag,
      });
      return `/event/${naddr}`;
    } catch (error) {
      console.error("Error creating event href:", error);
      return "#";
    }
  }, [event]);

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        ...sx,
      }}
    >
      <CardActionArea
        component={Link}
        href={eventHref}
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          alignItems: "stretch",
        }}
      >
        {metadata.image && (
          <Box sx={{ position: "relative" }}>
            <CardMedia
              component="img"
              src={metadata.image}
              alt={name}
              sx={{
                width: "100%",
                height: 200,
                objectFit: "cover",
              }}
            />
          </Box>
        )}
        <CardContent
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: 2,
          }}
        >
          {name && (
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
          )}
          {(metadata.start || metadata.end) && (
            <EventTimeDisplay
              startTime={metadata.start}
              endTime={metadata.end}
              typographyProps={{
                variant: "body2",
                fontSize: 14,
              }}
            />
          )}
          {metadata.location && (
            <EventLocationText
              location={metadata.location}
              geohash={metadata.geohash}
              typographyProps={{
                variant: "body2",
                fontSize: 14,
              }}
            />
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default EventPreviewCard;
