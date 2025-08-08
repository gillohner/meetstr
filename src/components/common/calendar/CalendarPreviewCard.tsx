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

  // Truncate text to prevent overflow
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  // Ensure safe text lengths for mobile
  const safeName = truncateText(name, 60); // Limit title length
  const safeSummary = metadata.summary
    ? truncateText(metadata.summary, 120)
    : ""; // Limit description

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
        maxWidth: "100%", // Prevent overflow on mobile
        overflow: "hidden", // Contain all content
        wordWrap: "break-word", // Break long words
        wordBreak: "break-word", // Break long words
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
            padding: { xs: 1.5, sm: 2 }, // Less padding on mobile
            minHeight: 0, // Allow flex shrinking
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
                fontSize: { xs: "1rem", sm: "1.25rem" }, // Smaller font on mobile
                lineHeight: 1.2,
                wordBreak: "break-word", // Break long words
                hyphens: "auto", // Allow hyphenation
              }}
            >
              {safeName}
            </Typography>
          )}
          {safeSummary && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: { xs: 2, sm: 3 }, // Less lines on mobile
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                mb: 1,
                fontSize: { xs: "0.75rem", sm: "0.875rem" }, // Smaller font on mobile
                lineHeight: 1.3,
                wordBreak: "break-word", // Break long words
                hyphens: "auto", // Allow hyphenation
                maxHeight: { xs: "2.6em", sm: "3.9em" }, // Limit height based on line clamp
              }}
            >
              {safeSummary}
            </Typography>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default CalendarPreviewCard;
