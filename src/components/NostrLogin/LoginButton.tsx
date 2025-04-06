// src/components/NostrLogin/LoginButton.tsx
'use client';

import React from 'react';
import Button from '@mui/material/Button';
import { useNostr } from '@/components/NostrProvider';
import { useTranslation } from 'react-i18next';

export default function LoginButton({ 
  variant = 'contained', 
  color = 'primary' 
}) {
  const { isLoggedIn, isLoading, login, isLoggingIn } = useNostr();
  const { t } = useTranslation();
  
  const handleClick = () => {
    if (!isLoading && !isLoggingIn) {
      login();
    }
  };

  if (isLoading) {
    return (
      <Button variant={variant} color={color} disabled>
        {t('common.loading')}
      </Button>
    );
  }
  
  if (isLoggedIn) {
    return (
      <Button variant={variant} color={color} onClick={logout}>
        {t('navbar.logout')}
      </Button>
    );
  }
  
  return (
    <Button 
      variant={variant} 
      color={color} 
      onClick={handleClick}
      disabled={isLoggingIn}
    >
      {isLoggingIn ? t('login.processing') : t('navbar.login')}
    </Button>
  );
}
