// src/components/NostrEventOverview/EventPreviewCard.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { NDKEvent } from '@nostr-dev-kit/ndk';
import { useRouter } from 'next/navigation';
import { nip19 } from 'nostr-tools';
import { Card, CardActionArea, CardContent, CardMedia, Typography, Box } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { getEventMetadata, formatDate } from '@/utils/eventUtils';

interface EventPreviewCardProps {
  event: NDKEvent;
  sx?: object;
}

const EventPreviewCard: React.FC<EventPreviewCardProps> = ({ event, sx = {} }) => {
  const { t } = useTranslation();
  const router = useRouter();
  
  // Extract event data using the utility function
  const metadata = getEventMetadata(event);
  const name = metadata.name || t('error.event.noName');
  console.log('Event metadata:', metadata);
  const formattedStartTime = metadata.start 
    ? formatDate(metadata.start, t('error.event.invalidDate')) 
    : t('error.event.noDate');
const formattedEndTime = metadata.end
    ? formatDate(metadata.end, t('error.event.invalidDate'))
    : t('error.event.noDate');
  
  // Generate the naddr for navigation
  const handleClick = () => {
    try {
      // Find d tag for the identifier
      const dTag = event.tags.find(t => t[0] === 'd')?.[1] || '';
      
      // Create naddr for reliable linking
      const naddr = nip19.naddrEncode({
        kind: event.kind,
        pubkey: event.pubkey,
        identifier: dTag
      });
      
      router.push(`/event/${naddr}`);
    } catch (error) {
      console.error('Error navigating to event:', error);
    }
  };
  console.log("metadata", metadata);
  return (
    <Card sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      height: '100%',
      width: '100%',
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 6
      },
      ...sx
    }}>
      <CardActionArea onClick={handleClick} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
        <CardMedia
          component="img"
          height="140"
          image={metadata.image}
          alt={name}
          sx={{ objectFit: 'cover', width: '100%' }}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography gutterBottom variant="h6" component="div" noWrap>
            {name}
          </Typography>
          
          {metadata.start && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {formattedStartTime}
              </Typography>
              {metadata.end && (
                <Typography variant="body2" color="text.secondary">
                    {formattedEndTime}
                </Typography>
                )}
            </Box>
          )}
          
          {metadata.location && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LocationOnIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary" noWrap>
                {metadata.location}
              </Typography>
            </Box>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default EventPreviewCard;
