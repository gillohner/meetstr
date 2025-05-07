// src/components/common/events/EventLocationMapCard/EventLocationMapCard.tsx
import { Box, Card, CardContent, Typography, Link, Chip, Stack, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { useLocationData } from '@/hooks/useLocationData';
import { CircularProgress } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ContactlessOutlinedIcon from '@mui/icons-material/ContactlessOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import CurrencyBitcoinOutlinedIcon from '@mui/icons-material/CurrencyBitcoinOutlined';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';

interface EventLocationMapCardProps {
  metadata: {
    location?: string;
    geohash?: string;
  };
}

const EventLocationMapCard: React.FC<EventLocationMapCardProps> = ({ metadata }) => {
  const { t } = useTranslation();
  const { data: locationData, isLoading } = useLocationData(
    metadata.location, 
    metadata.geohash
  )

  const renderPaymentBadges = () => {
    if (!locationData?.paymentMethods.acceptsBitcoin) return null;
  
    return (
      <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
        <Tooltip title={t('payment.bitcoinAccepted')}>
          <Chip 
            label={<CurrencyBitcoinOutlinedIcon />}
            sx={{ 
              backgroundColor: '#F7931A22', 
              color: '#F7931A',
              '& .MuiChip-label': { 
                p: 0.5,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }
            }}
          />
        </Tooltip>
  
        {locationData.paymentMethods.onChain && (
          <Tooltip title={t('payment.onChain')}>
            <Chip
              label={<LinkOutlinedIcon />}
              sx={{ 
                backgroundColor: 'action.selected',
                '& .MuiChip-label': { 
                  p: 0.5,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }
              }}
            />
          </Tooltip>
        )}
  
        {locationData.paymentMethods.lightning && (
          <Tooltip title={t('payment.lightning')}>
            <Chip
              label={<BoltOutlinedIcon />}
              sx={{ 
                backgroundColor: 'warning.light',
                color: 'warning.contrastText',
                '& .MuiChip-label': { 
                  p: 0.5,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }
              }}
            />
          </Tooltip>
        )}
  
        {locationData.paymentMethods.contactless && (
          <Tooltip title={t('payment.contactless')}>
            <Chip
              label={<ContactlessOutlinedIcon />}
              sx={{ 
                backgroundColor: 'success.light',
                color: 'success.contrastText',
                '& .MuiChip-label': { 
                  p: 0.5,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }
              }}
            />
          </Tooltip>
        )}
      </Box>
    );
  };

  const renderMapFrame = () => {
    if (!locationData) return null;
    
    return (
      <iframe
        title="location-map"
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${
          locationData.coords.longitude - 0.01
        },${locationData.coords.latitude - 0.01},${
          locationData.coords.longitude + 0.01
        },${locationData.coords.latitude + 0.01}&layer=mapnik&marker=${
          locationData.coords.latitude
        },${locationData.coords.longitude}`}
        style={{ border: 'none', width: '100%', height: '300px' }}
      />
    );
  };

  const renderMapLinks = () => (
    <Stack direction="column" spacing={0} sx={{ mt: 1, flexWrap: 'wrap', gap: 1.5, fontSize: '0.8rem' }}>
      {locationData?.mapLinks.osm && (
        <Link href={locationData.mapLinks.osm} target="_blank" display="flex" alignItems="center">
          {t('service.openstreetmap')} <OpenInNewIcon fontSize="inherit" sx={{ ml: 0.5 }} />
        </Link>
      )}
      {locationData?.mapLinks.btcmap && (
        <Link href={locationData.mapLinks.btcmap} target="_blank" display="flex" alignItems="center">
          {t('service.btcmap')} <OpenInNewIcon fontSize="inherit" sx={{ ml: 0.5 }} />
        </Link>
      )}
      {locationData?.mapLinks.google && (
        <Link href={locationData?.mapLinks.google} target="_blank" display="flex" alignItems="center">
          {t('service.googlemaps')}  <OpenInNewIcon fontSize="inherit" sx={{ ml: 0.5 }} />
        </Link>
      )}
      {locationData?.mapLinks.apple && (
        <Link href={locationData?.mapLinks.apple} target="_blank" display="flex" alignItems="center">
          {t('service.applemaps')}  <OpenInNewIcon fontSize="inherit" sx={{ ml: 0.5 }} />
        </Link>
      )}
    </Stack>
  );

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {t('event.location')}
        </Typography>

        {isLoading && <CircularProgress size={24} />}

        {locationData && (
          <>
            {renderMapFrame()}
            {renderPaymentBadges()}
            {renderMapLinks()}
          </>
        )}

        {!isLoading && !locationData && (
          <Typography variant="body2" color="text.secondary">
            {t('event.noLocation')}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default EventLocationMapCard;
