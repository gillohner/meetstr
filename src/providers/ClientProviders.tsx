// src/providers/ClientProviders.tsx
'use client';
import { ReactNode, useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { ThemeProvider } from '@mui/material/styles';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { initI18n } from '@/lib/i18n';
import theme from '@/theme';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import CustomAppBar from '@/components/common/layout/AppBar/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import { useNdk, useLogin } from 'nostr-hooks';
import { SnackbarProvider } from '@/context/SnackbarContext';
import { openDB } from 'idb';
import { QueryClientProvider } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { queryClient } from '@/utils/queryClient';
import { createIDBPersister } from '@/utils/persister';

export default function ClientProviders({
  children,
  serverLang
}: {
  children: ReactNode;
  serverLang: string;
}) {
  const [isReady, setIsReady] = useState(false);
  const i18n = initI18n(serverLang);
  const { initNdk, ndk } = useNdk();
  const { loginFromLocalStorage } = useLogin();

  useEffect(() => {
    initNdk({
      explicitRelayUrls: [
        "wss://nostr.swiss-enigma.ch/",
        "wss://relay.damus.io/",
        "wss://relay.nostr.band"
      ]
    });
  }, [initNdk]);

  useEffect(() => {
    ndk?.connect(); // This will also reconnect when the instance changes
  }, [ndk]);

  // Login from local storage
  useEffect(() => {
    loginFromLocalStorage();
  }, [loginFromLocalStorage]);

  // Initialize DB only on client side
  useEffect(() => {
    const initialize = async () => {
      try {
        if (typeof window !== 'undefined') { // Add client-side check
          const db = await openDB('query-cache', 1, {
            upgrade(db) {
              if (!db.objectStoreNames.contains('queries')) {
                db.createObjectStore('queries');
              }
            }
          });
          console.log('Database ready with stores:', db.objectStoreNames);
        }
      } catch (error) {
        console.error('Database initialization failed:', error);
      }
    };
    initialize();
  }, []);

  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister: createIDBPersister('query-cache') }}
      >
        <I18nextProvider i18n={i18n}>
          <ThemeProvider theme={theme}>
            <SnackbarProvider>
              <InitColorSchemeScript attribute="class" />
              <CustomAppBar />
              <CssBaseline />
              {children}
            </SnackbarProvider>
          </ThemeProvider>
        </I18nextProvider>
      </PersistQueryClientProvider>
    </AppRouterCacheProvider>
  );
}
