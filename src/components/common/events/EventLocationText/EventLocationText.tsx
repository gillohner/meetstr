// src/components/common/events/EventLocationText/EventLocationText.tsx
import { Box, Typography, TypographyProps } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { CircularProgress } from '@mui/material';
import { formatTextWithLineBreaks } from '@/utils/formatting/text';
import { useLocationInfo } from '@/hooks/useLocationInfo';

interface EventLocationTextProps {
  location?: string | null;
  geohash?: string | null;
  typographyProps?: TypographyProps;
}

export default function EventLocationText({ location, geohash, typographyProps }: EventLocationTextProps) {
  if (!location && !geohash) return null;
  
  // TODO: Fix Nomination Caching and Batch fetching before displaying nice looking address in preview cards
  // const { data: locationData, isLoading } = useLocationInfo(location, geohash);
  const locationData = []; // Placeholder for the actual data fetching logic
  const isLoading = true; // Placeholder for the loading state
  
  return (
    <Box sx={{ display: 'flex', mb: 2 }}>
      <LocationOnIcon sx={{ mr: 1, color: 'text.secondary' }} />
      {isLoading ? (
        <Typography
          variant="body1"
          color="text.secondary"
          {...typographyProps}
          sx={{ whiteSpace: 'pre-line', ...typographyProps?.sx }}
        >
          {formatTextWithLineBreaks(location)}
        </Typography>
      ) : (
        <Typography
          variant="body1"
          color="text.secondary"
          {...typographyProps}
          sx={{ whiteSpace: 'pre-line', ...typographyProps?.sx }}
        >
          {formatTextWithLineBreaks(locationData?.formattedName)}
          {locationData?.formattedName && locationData?.formattedAddress && <br />}
          {formatTextWithLineBreaks(locationData?.formattedAddress)}
        </Typography>
      )}
    </Box>
  );
}
