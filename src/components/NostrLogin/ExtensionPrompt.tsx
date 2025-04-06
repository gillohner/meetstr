// src/components/NostrLogin/ExtensionPrompt.tsx
'use client';

import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Link } from '@mui/material';
import { useNostr } from '@/components/NostrProvider';
import { useTranslation } from 'react-i18next';

interface ExtensionPromptProps {
  open: boolean;
  onClose: () => void;
}

export default function ExtensionPrompt({ open, onClose }: ExtensionPromptProps) {
  const { t } = useTranslation();
  
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{t('nostr.extensionNeeded', 'Nostr Extension Required')}</DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          {t('nostr.noExtensionMessage', 'To log in with Nostr, you need a browser extension that supports NIP-07.')}
        </Typography>
        <Typography variant="body2" gutterBottom sx={{ mt: 2 }}>
          {t('nostr.recommendedExtensions', 'Recommended extensions:')}
        </Typography>
        <ul>
          <li>
            <Link href="https://getalby.com/" target="_blank" rel="noopener noreferrer">
              Alby
            </Link>
          </li>
          <li>
            <Link href="https://github.com/fiatjaf/nos2x" target="_blank" rel="noopener noreferrer">
              nos2x
            </Link>
          </li>
        </ul>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('common.close', 'Close')}</Button>
      </DialogActions>
    </Dialog>
  );
}
