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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

export default function ClientProviders({
  children,
  serverLang,
}: {
  children: ReactNode;
  serverLang: string;
}) {
  const i18n = initI18n(serverLang);
  const { initNdk, ndk } = useNdk();
  const { loginFromLocalStorage } = useLogin();

  useEffect(() => {
    initNdk({
      explicitRelayUrls: ["wss://multiplexer.huszonegy.world/"],
    });
  }, [initNdk]);

  useEffect(() => {
    ndk?.connect(); // This will also reconnect when the instance changes
  }, [ndk]);

  // Login from local storage
  useEffect(() => {
    loginFromLocalStorage();
  }, [loginFromLocalStorage]);

  return (
    <QueryClientProvider client={queryClient}>
      <AppRouterCacheProvider options={{ enableCssLayer: true }}>
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
      </AppRouterCacheProvider>
    </QueryClientProvider>
  );
}
