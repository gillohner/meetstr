// src/providers/ClientProviders.tsx
"use client";

import { type ReactNode, useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import { ThemeProvider } from "@mui/material/styles";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { initI18n } from "@/lib/i18n";
import theme from "@/theme";
import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";
import CustomAppBar from "@/components/common/layout/AppBar/AppBar";
import CssBaseline from "@mui/material/CssBaseline";
import { useNdk } from "nostr-hooks"; // Keep using nostr-hooks
import { SnackbarProvider } from "@/context/SnackbarContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useLanguageSync } from "@/hooks/useLanguageSync";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

function ProviderContent({ children }: { children: ReactNode }) {
  const { initNdk, ndk } = useNdk();
  const [nostrLoginReady, setNostrLoginReady] = useState(false);

  // Sync language preferences after hydration
  useLanguageSync();

  // Initialize nostr-login (replaces your manual session management)
  useEffect(() => {
    import('nostr-login')
      .then(async ({ init }) => {
        init({
          bunkers: 'nsec.app,highlighter.com', // Default bunker providers
          theme: 'default',
          darkMode: false, // You can sync this with your theme
          perms: 'sign_event:1,nip04_encrypt,nip04_decrypt',
          noBanner: true, // Hide the default banner since you have custom UI
          methods: 'connect,extension', // FIXED: Should be string, not array
          onAuth: (npub, options) => {
            console.log('User authenticated via nostr-login:', npub, options);
            // Trigger a custom event to notify your React components
            document.dispatchEvent(new CustomEvent('nostrLoginAuth', { 
              detail: { npub, options } 
            }));
          },
          onLogout: () => {
            console.log('User logged out via nostr-login');
            // Trigger a custom event to notify your React components
            document.dispatchEvent(new CustomEvent('nostrLoginLogout'));
          }
        });
        setNostrLoginReady(true);
      })
      .catch((error) => console.log('Failed to load nostr-login', error));
  }, []);

  useEffect(() => {
    if (!nostrLoginReady) return;
    
    initNdk({
      explicitRelayUrls: [
        "wss://multiplexer.huszonegy.world/",
        "wss://relay.damus.io",
        "wss://nos.lol",
        "wss://relay.primal.net",
        "wss://relay.nostr.band",
        "wss://relay.nostr.watch",
        "wss://relay.snort.social",
      ],
    });
  }, [initNdk, nostrLoginReady]);

  useEffect(() => {
    if (!ndk) return;
    ndk.connect();
  }, [ndk]);

  return (
    <SnackbarProvider>
      <CustomAppBar />
      {children}
    </SnackbarProvider>
  );
}

export default function ClientProviders({
  children,
  serverLang,
}: {
  children: ReactNode;
  serverLang: string;
}) {
  const [i18nInstance] = useState(() => initI18n(serverLang));

  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18nInstance}>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <ThemeProvider theme={theme}>
            <InitColorSchemeScript attribute="class" />
            <CssBaseline />
            <ProviderContent>{children}</ProviderContent>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </I18nextProvider>
    </QueryClientProvider>
  );
}
