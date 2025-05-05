import { Box, Typography, TypographyProps } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';

interface EventLocationDisplayProps {
  location?: string | null;
  typographyProps?: TypographyProps;
}

export default function EventLocationDisplay({ location, typographyProps }: EventLocationDisplayProps) {
  if (!location) return null;
  return (
    <Box sx={{ display: 'flex', mb: 2 }}>
      <LocationOnIcon sx={{ mr: 1, color: 'text.secondary' }} />
      <Typography
        variant="body1"
        color="text.secondary"
        {...typographyProps}
      >
        {location}
      </Typography>
    </Box>
  );
}
