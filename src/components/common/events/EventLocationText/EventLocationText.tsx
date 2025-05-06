import { Box, Typography, TypographyProps } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useEffect, useState } from 'react';
import { LocationData, getLocationInfo } from '@/utils/location/locationInfo';
import { CircularProgress } from '@mui/material';
import { formatTextWithLineBreaks } from '@/utils/formatting/formatTextWithLineBreaks';

interface EventLocationTextProps {
  location?: string | null;
  geohash?: string | null;
  typographyProps?: TypographyProps;
}

export default function EventLocationText({ location, geohash, typographyProps }: EventLocationTextProps) {
  if (!location && !geohash) return null;
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadLocation = async () => {
      setLoading(true);
      try {
        const data = await getLocationInfo(location || '', geohash);
        setLocationData(data);
      } finally {
        setLoading(false);
      }
    };

    if (location || geohash) {
      loadLocation();
    }
  }, [location, geohash]);

  return (
    <Box sx={{ display: 'flex', mb: 2 }}>
      <LocationOnIcon sx={{ mr: 1, color: 'text.secondary' }} />
      {loading ? (
        <CircularProgress size={22} />
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
