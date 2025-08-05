// src/components/common/events/EventTimeDisplay.tsx
import React, { useState, useEffect } from "react";
import { Typography, Box } from "@mui/material";
import type { TypographyProps } from "@mui/material";
import { formatDateRange, formatDate } from "@/utils/formatting/date";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

interface EventTimeDisplayProps {
  startTime?: string | null;
  endTime?: string | null;
  typographyProps?: Omit<TypographyProps, "children">;
}

const EventTimeDisplay: React.FC<EventTimeDisplayProps> = ({
  startTime,
  endTime,
  typographyProps = {},
}) => {
  const [isClient, setIsClient] = useState(false);
  const [formattedDate, setFormattedDate] = useState<string>("");

  useEffect(() => {
    setIsClient(true);

    // Format date on client side only to prevent hydration mismatch
    if (startTime) {
      const formatted = endTime
        ? formatDateRange(startTime, endTime, "Invalid date")
        : formatDate(startTime, "Invalid date");
      setFormattedDate(formatted || "Invalid date");
    }
  }, [startTime, endTime]);

  if (!startTime) {
    return (
      <Typography variant="body2" color="text.secondary" {...typographyProps}>
        No date specified
      </Typography>
    );
  }

  // During SSR, show a simple placeholder to avoid hydration mismatch
  if (!isClient) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <AccessTimeIcon sx={{ mr: 1, color: "text.secondary" }} />
        <Typography variant="body2" color="text.secondary" {...typographyProps}>
          Loading date...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
      <AccessTimeIcon sx={{ mr: 1, color: "text.secondary" }} />
      <Typography variant="body2" color="text.secondary" {...typographyProps}>
        {formattedDate}
      </Typography>
    </Box>
  );
};

export default EventTimeDisplay;
