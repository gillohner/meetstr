// src/components/NostrLogin/LoginButton.tsx
'use client';

import React from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Container from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLogin } from 'nostr-hooks';
import { Divider } from '@mui/material';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export default function LoginButton({ 
  variant = 'contained', 
  color = 'primary' 
}) {
  const { t } = useTranslation();
  
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const {
    loginWithExtension,
    loginWithRemoteSigner,
    loginWithPrivateKey
  } = useLogin();
  
  return (
    <>
      <Button 
        variant={variant} 
        color={color} 
        onClick={handleOpen}
      >
        {t('navbar.login')}
      </Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {t('modal.login.title')}
          </Typography>
          <Button 
            variant={variant} 
            color={color} 
            onClick={loginWithExtension}
          >
            {t('modal.login.extension')}
          </Button>
          <Divider />
          <button onClick={() => loginWithRemoteSigner()}>Login with Remote Signer</button>
         <button onClick={() => loginWithPrivateKey()}>Login with Secret Key</button>
        </Box>
      </Modal>
    </>
  );
}
