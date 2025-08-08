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
  typographyProps,
}: EventLocationTextProps) {
  if (!location) return null;

  return (
    <Box sx={{ display: "flex", mb: 2 }}>
      <LocationOnIcon sx={{ mr: 1, color: "text.secondary" }} />
      {location && (
        <Typography
          variant="body1"
          color="text.secondary"
          {...typographyProps}
          sx={{
            whiteSpace: "pre-line",
            wordBreak: "break-word", // Break long words
            hyphens: "auto", // Allow hyphenation
            overflow: "hidden", // Hide overflow
            display: "-webkit-box",
            WebkitLineClamp: { xs: 2, sm: 3 }, // Limit lines on mobile
            WebkitBoxOrient: "vertical",
            textOverflow: "ellipsis",
            fontSize: { xs: "0.875rem", sm: "1rem" }, // Smaller font on mobile
            ...typographyProps?.sx,
          }}
        >
          {formatTextWithLineBreaks(location)}
        </Typography>
      )}
    </Box>
  );
}
