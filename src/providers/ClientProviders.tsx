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
import { useNdk, useLogin } from "nostr-hooks";
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
  const { loginFromLocalStorage } = useLogin();

  // Sync language preferences after hydration
  useLanguageSync();

  useEffect(() => {
    initNdk({
      explicitRelayUrls: [
        "wss://multiplexer.huszonegy.world/",
        "wss://relay.damus.io",
        "wss://nos.lol",
        "wss://relay.primal.net",
        "wss://relay.nostr.band",
        "wss://relay.nostr.watch",
        "wss://relay.snort.social",
        "wss://relay.nostr.band",
      ],
    });
  }, [initNdk]);

  useEffect(() => {
    if (!ndk) return;
    ndk.connect(); // This will also reconnect when the instance changes
  }, [ndk]);

  useEffect(() => {
    loginFromLocalStorage();
  }, [loginFromLocalStorage]);

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
