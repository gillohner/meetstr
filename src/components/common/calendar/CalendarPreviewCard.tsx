"use client";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { type NDKEvent } from "@nostr-dev-kit/ndk";
import Link from "next/link";
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Stack,
} from "@mui/material";
import { getEventMetadata } from "@/utils/nostr/eventUtils";
import { nip19 } from "nostr-tools";

interface CalendarPreviewCardProps {
  calendar: NDKEvent;
  sx?: object;
  eventCounts?: {
    upcoming: number;
    past: number;
  };
}

const CalendarPreviewCard: React.FC<CalendarPreviewCardProps> = ({
  calendar,
  sx = {},
  eventCounts,
}) => {
  const { t } = useTranslation();
  const metadata = getEventMetadata(calendar);
  const name = metadata.title || t("calendar.untitled", "Untitled Calendar");

  const calendarHref = useMemo(() => {
    try {
      const dTag = calendar.tags.find((t) => t[0] === "d")?.[1] || "";
      const naddr = nip19.naddrEncode({
        kind: calendar.kind,
        pubkey: calendar.pubkey,
        identifier: dTag,
      });
      return `/calendar/${naddr}`;
    } catch (error) {
      console.error("Error creating calendar href:", error);
      return `/calendar/${calendar.id}`;
    }
  }, [calendar]);

  const eventCount = calendar.tags.filter((t) => t[0] === "a").length;

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
        href={calendarHref}
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
          {metadata.summary && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                mb: 1,
              }}
            >
              {metadata.summary}
            </Typography>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default CalendarPreviewCard;
