// src/components/common/events/EventRsvpMenu/EventRsvpMenu.tsx

import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import { Button, Menu, MenuItem, MenuProps } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useTranslation } from 'react-i18next';
import { createRsvpEvent, publishRsvp } from '@/utils/nostr/rsvpUtils';
import { useSnackbar } from '@/context/SnackbarContext';
import { t } from 'i18next';

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

export default function EventRsvpMenu({ event }: EventRsvpMenuProps) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleRsvp = async (status: string) => {
    setLoading(true);
    try {
      const rsvpEvent = createRsvpEvent(event, status);
      const success = await publishRsvp(rsvpEvent);
      
      if (success) {
        showSnackbar('RSVP submitted successfully', 'success');
      } else {
        showSnackbar('Failed to submit RSVP', 'error');
      }
    } catch (error) {
      showSnackbar('Error submitting RSVP', 'error');
      console.error('RSVP error:', error);
    } finally {
      setLoading(false);
      handleClose();
    }
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        size="large"
        onClick={handleClick}
        endIcon={<KeyboardArrowDownIcon />}
        sx={{ width: '100%' }}
        disabled={loading}
      >
        {loading ? t('event.rsvp.submitting') : t('event.rsvp.title')}
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
