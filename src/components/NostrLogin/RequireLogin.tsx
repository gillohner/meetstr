// src/components/NostrLogin/RequireLogin.tsx
'use client';

import React, { ReactNode, useState } from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { useNostr } from '@/components/NostrProvider';
import { useTranslation } from 'react-i18next';
import ExtensionPrompt from '@/components/NostrLogin/ExtensionPrompt';

interface RequireLoginProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function RequireLogin({ children, fallback }: RequireLoginProps) {
  const { isLoggedIn, isLoading, login, isExtensionAvailable, error } = useNostr();
  const [showExtensionPrompt, setShowExtensionPrompt] = useState(false);
  const { t } = useTranslation();
  
  const handleLoginClick = async () => {
    if (!isExtensionAvailable) {
      setShowExtensionPrompt(true);
      return;
    }
    
    await login();
  };
  
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!isLoggedIn) {
    if (fallback) return <>{fallback}</>;
    
    return (
      <>
        <Box 
          sx={{ 
            p: 3, 
            border: '1px dashed', 
            borderColor: 'divider',
            borderRadius: 2,
            textAlign: 'center' 
          }}
        >
          <Typography variant="body1" gutterBottom>
            {t('login.requiredMessage', 'Please sign in with Nostr to access this content')}
          </Typography>
          
          {error && (
            <Typography color="error" variant="body2" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
          
          <Button 
            variant="contained" 
            onClick={handleLoginClick}
            sx={{ mt: 2 }}
          >
            {t('login.signIn', 'Sign in with Nostr')}
          </Button>
        </Box>
        
        <ExtensionPrompt 
          open={showExtensionPrompt} 
          onClose={() => setShowExtensionPrompt(false)} 
        />
      </>
    );
  }
  
  return <>{children}</>;
}
