// src/components/common/events/EventLocationText.tsx
import { Box, Typography } from "@mui/material";
import type { TypographyProps } from "@mui/material/Typography";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { formatTextWithLineBreaks } from "@/utils/formatting/text";

interface EventLocationTextProps {
  location?: string | null;
  geohash?: string | null;
  typographyProps?: TypographyProps;
}

export default function EventLocationText({
  location,
  geohash,
  typographyProps,
}: EventLocationTextProps) {
  if (!location) return null;

  return (
    <Box sx={{ display: "flex", mb: 2 }}>
      <LocationOnIcon sx={{ mr: 1, color: "text.secondary" }} />
      <Typography
        variant="body1"
        color="text.secondary"
        {...typographyProps}
        sx={{ whiteSpace: "pre-line", ...typographyProps?.sx }}
      >
        {location && (
          <Typography
            variant="body1"
            color="text.secondary"
            {...typographyProps}
            sx={{ whiteSpace: "pre-line", ...typographyProps?.sx }}
          >
            {formatTextWithLineBreaks(location)}
          </Typography>
        )}
      </Typography>
    </Box>
  );
}
