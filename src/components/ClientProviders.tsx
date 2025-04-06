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

export default function ClientProviders({
  children,
  serverLang
}: {
  children: ReactNode;
  serverLang: string;
}) {
  const [isReady, setIsReady] = useState(false);
  const i18n = initI18n(serverLang);

  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <I18nextProvider i18n={i18n}>
        <ThemeProvider theme={theme}>
          <InitColorSchemeScript attribute="class" />
          <ResponsiveAppBar />
          <CssBaseline />
          {children}
        </ThemeProvider>
      </I18nextProvider>
    </AppRouterCacheProvider>
  );
}
