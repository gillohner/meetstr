// src/components/ClientProviders.tsx
'use client';

import { ReactNode, useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { ThemeProvider } from '@mui/material/styles';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { initI18n } from '@/lib/i18n';
import theme from '@/theme';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import ResponsiveAppBar from '@/components/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import NostrProvider from '@/components/NostrProvider';

export default function ClientProviders({
  children,
  serverLang
}: {
  children: ReactNode;
  serverLang: string;
}) {
  const [isReady, setIsReady] = useState(false);
  const i18n = initI18n(serverLang);

  useEffect(() => {
    // When translations are loaded and ready, mark as ready
    if (i18n.isInitialized && i18n.language === serverLang) {
      setIsReady(true);
    }
  }, [serverLang, i18n]);

  // Return a simple loading state or nothing until i18n is ready
  // This prevents hydration mismatches
  if (!isReady) {
    return null;
  }

  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <I18nextProvider i18n={i18n}>
        <NostrProvider>
          <ThemeProvider theme={theme}>
            <InitColorSchemeScript attribute="class" />
            <ResponsiveAppBar />
            <CssBaseline />
            {children}
          </ThemeProvider>
        </NostrProvider>
      </I18nextProvider>
    </AppRouterCacheProvider>
  );
}
