// src/components/common/VirtualEventList.tsx
import React, { useMemo } from "react";
import { FixedSizeList as List } from "react-window";
import { Box, useTheme, useMediaQuery } from "@mui/material";
import type { NDKEvent } from "@nostr-dev-kit/ndk";

interface VirtualEventListProps {
  events: NDKEvent[];
  ItemComponent: React.ComponentType<{
    event: NDKEvent;
    style: React.CSSProperties;
  }>;
  itemHeight?: number;
  height?: number;
  overscan?: number;
}

export default function VirtualEventList({
  events,
  ItemComponent,
  itemHeight = 120,
  height = 600,
  overscan = 5,
}: VirtualEventListProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const adjustedItemHeight = isMobile ? itemHeight * 1.2 : itemHeight;
  const adjustedHeight = Math.min(height, events.length * adjustedItemHeight);

  const Item = useMemo(() => {
    return ({
      index,
      style,
    }: {
      index: number;
      style: React.CSSProperties;
    }) => {
      const event = events[index];
      if (!event) return null;

      return (
        <div style={style}>
          <ItemComponent event={event} style={style} />
        </div>
      );
    };
  }, [events, ItemComponent]);

  if (events.length === 0) return null;

  return (
    <Box sx={{ width: "100%", height: adjustedHeight }}>
      <List
        height={adjustedHeight}
        itemCount={events.length}
        itemSize={adjustedItemHeight}
        overscanCount={overscan}
        width="100%"
      >
        {Item}
      </List>
    </Box>
  );
}
