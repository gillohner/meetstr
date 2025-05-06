// src/components/common/events/EventAttendeesCard.tsx
import { AvatarGroup, Avatar, Tooltip, Card, CardContent, Typography } from '@mui/material';
import { useProfile } from 'nostr-hooks';
import { nip19 } from 'nostr-tools';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface Participant {
  pubkey: string;
  relay?: string;
  role?: string;
}

interface EventAttendeesCardProps {
  participants: Participant[];
}

const EventAttendeesCard = ({ participants }: EventAttendeesCardProps) => {
  const { t } = useTranslation();
  const maxVisible = 5;
  const slicedParticipants = participants.slice(0, maxVisible);

  return (
    <Card elevation={3} sx={{ mt: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          {t('event.attendees')}
        </Typography>
        <AvatarGroup 
          max={maxVisible}
          spacing="small"
          sx={{ 
            justifyContent: 'start',
           }}
          renderSurplus={(surplus) => (
            <Tooltip 
              title={participants
                .slice(maxVisible)
                .map(p => nip19.npubEncode(p.pubkey))
                .join(', ')}
            >
              <Avatar 
                sx={{ 
                  bgcolor: 'secondary.main', 
                  cursor: 'pointer',
                  '&:hover': { transform: 'scale(1.1)' }
                }}
              >
                +{surplus}
              </Avatar>
            </Tooltip>
          )}
        >
          {slicedParticipants.map((participant) => (
            <ParticipantAvatar 
              key={participant.pubkey} 
              pubkey={participant.pubkey} 
            />
          ))}
        </AvatarGroup>
      </CardContent>
    </Card>
  );
};

const ParticipantAvatar = ({ pubkey }: { pubkey: string }) => {
  const { profile, isLoading } = useProfile({ pubkey });
  const npub = useMemo(() => nip19.npubEncode(pubkey), [pubkey]);

  const handleClick = () => {
    window.open(`https://njump.me/${npub}`, '_blank');
  };

  if (isLoading) {
    return (
      <Avatar sx={{ bgcolor: 'grey.300' }} />
    );
  }

  return (
    <Tooltip title={profile?.displayName || npub}>
      <Avatar
        src={profile?.image}
        onClick={handleClick}
        sx={{ 
          cursor: 'pointer',
          transition: 'transform 0.2s',
          '&:hover': { transform: 'scale(1.15)' }
        }}
      >
        {!profile?.image && (profile?.displayName?.[0]?.toUpperCase() || npub.slice(0, 2))}
      </Avatar>
    </Tooltip>
  );
};

export default EventAttendeesCard;
