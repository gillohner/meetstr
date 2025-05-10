import { Box, Typography, TypographyProps } from "@mui/material";
import { formatDate, formatDateRange } from "@/utils/formatting/date";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useTranslation } from "react-i18next";

interface EventTimeDisplayProps {
  startTime: string;
  endTime?: string | null;
  typographyProps?: TypographyProps;
}

export default function EventTimeDisplay({
  startTime,
  endTime,
  typographyProps,
}: EventTimeDisplayProps) {
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
