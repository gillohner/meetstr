// src/components/common/events/EventTimeDisplay.tsx
import { Box, Typography, type TypographyProps } from "@mui/material";
import { formatDateRange } from "@/utils/formatting/date";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useTranslation } from "react-i18next";

interface EventTimeDisplayProps {
  startTime?: string | null;
  endTime?: string | null;
  typographyProps?: TypographyProps;
}

export default function EventTimeDisplay({
  startTime,
  endTime,
  typographyProps,
}: EventTimeDisplayProps) {
  if (!startTime) return null;
  const { t } = useTranslation();

  const formattedDateRange = formatDateRange(
    startTime,
    endTime,
    t("error.event.invalidDate", "Invalid date")
  );

  return (
    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
      <AccessTimeIcon sx={{ mr: 1, color: "text.secondary" }} />
      <Typography variant="body1" color="text.secondary" {...typographyProps}>
        {formattedDateRange}
      </Typography>
    </Box>
  );
}
