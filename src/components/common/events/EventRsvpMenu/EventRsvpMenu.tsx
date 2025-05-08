// src/components/common/events/EventRsvpMenu/EventRsvpMenu.tsx

import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import { Button, CircularProgress, Menu, MenuItem, MenuProps } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useTranslation } from 'react-i18next';
import { createRsvpEvent, publishRsvp } from '@/utils/nostr/rsvpUtils';
import { useSnackbar } from '@/context/SnackbarContext';
import { t } from 'i18next';
import { useNdk } from 'nostr-hooks';
import { useCallback } from 'react';
import { NDKEvent } from '@nostr-dev-kit/ndk';
import { v4 as uuidv4 } from 'uuid';
import { useActiveUser } from 'nostr-hooks';
import { Circle } from 'react-leaflet';

const StyledRsvpMenu = styled((props: MenuProps) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}
    {...props}
  />
))(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 6,
    marginTop: theme.spacing(1),
    minWidth: 180,
    boxShadow:
      'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
    '& .MuiMenu-list': {
      padding: 0,
    },
    '& .MuiMenuItem-root': {
      padding: theme.spacing(1.5, 2),
      '& .MuiSvgIcon-root': {
        fontSize: 20,
        marginRight: theme.spacing(1.5),
      },
    },
  },
}));

export default function EventRsvpMenu({ event }) {
  const { t } = useTranslation();
  const { ndk } = useNdk();
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const { activeUser } = useActiveUser();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleRsvp = useCallback((status: string) => {
    const rsvpEvent = new NDKEvent(ndk);
    rsvpEvent.content = status;
    rsvpEvent.kind = 31925;

    console.log("event: ", event.pubkey);

    const aTag = `31922:${event.pubkey}:${event.tagValue('d')}`;
    rsvpEvent.tags = [
      ['a', aTag],
      ['d', uuidv4()],
      ['status', status],
      ['p', activeUser.pubkey]
    ];

    rsvpEvent.publish();
  }, [ndk, activeUser]);
  
  if (activeUser === undefined) return <CircularProgress size={24} />;
  // TODO: Add button to login
  if (activeUser === null) return null;

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        size="large"
        onClick={handleClick}
        endIcon={<KeyboardArrowDownIcon />}
        sx={{ width: '100%' }}
      >
        {t('event.rsvp.title')}
      </Button>
      <StyledRsvpMenu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem
          onClick={() => handleRsvp('accepted')} 
          disabled={loading}
          sx={(theme) => ({
            backgroundColor: alpha(theme.palette.success.main, 0.1),
            color: theme.palette.success.dark,
            '&:hover': {
              backgroundColor: alpha(theme.palette.success.main, 0.2),
            },
          })}
        >
          <CheckIcon />
          {t('event.rsvp.accept')}
        </MenuItem>
        <MenuItem
          onClick={() => handleRsvp('tentative')} 
          disabled={loading}
            sx={(theme) => ({
            backgroundColor: alpha(theme.palette.warning.main, 0.1),
            color: theme.palette.warning.dark,
            '&:hover': {
              backgroundColor: alpha(theme.palette.warning.main, 0.2),
            },
          })}
        >
          <HelpOutlineIcon />
          {t('event.rsvp.maybe')}
        </MenuItem>
        <MenuItem
          onClick={() => handleRsvp('declined')} 
          disabled={loading}
          sx={(theme) => ({
            backgroundColor: alpha(theme.palette.error.main, 0.1),
            color: theme.palette.error.dark,
            '&:hover': {
              backgroundColor: alpha(theme.palette.error.main, 0.2),
            },
          })}
        >
          <CloseIcon />
          {t('event.rsvp.decline')}
        </MenuItem>
      </StyledRsvpMenu>
    </>
  );
}
