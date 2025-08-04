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
import { useNdk } from "nostr-hooks";
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

  // Initialize nostr-login with floating manager (like nostr.band)
  useEffect(() => {
    import("nostr-login")
      .then(async ({ init }) => {
        init({
          bunkers: "nsec.app,highlighter.com,amber.app",
          theme: "default",
          darkMode: false,
          perms: "sign_event:1,nip04_encrypt,nip04_decrypt",
          noBanner: false, // ENABLE the floating manager banner
          methods: "connect,extension",
          onAuth: async (npub, options) => {
            console.log("User authenticated:", npub, options);
            // Re-initialize NDK with the new signer
            setTimeout(async () => {
              await initializeNdkWithSigner();
            }, 200);
          },
          onLogout: () => {
            console.log("User logged out");
            // Re-initialize NDK without signer
            setTimeout(async () => {
              await initializeNdkWithoutSigner();
            }, 100);
          },
        });
        setNostrLoginReady(true);
      })
      .catch((error) => console.log("Failed to load nostr-login", error));
  }, []);

  // Initialize NDK with signer when window.nostr is available
  const initializeNdkWithSigner = async () => {
    if (typeof window !== "undefined" && window.nostr) {
      const { NDKNip07Signer } = await import("@nostr-dev-kit/ndk");
      const signer = new NDKNip07Signer();

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
        signer, // This is the key - pass the signer to NDK
      });
    }
  };

  // Initialize NDK without signer when logged out
  const initializeNdkWithoutSigner = async () => {
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
      // No signer when logged out
    });
  };

  useEffect(() => {
    if (!nostrLoginReady) return;

    // Check if user is already logged in and initialize accordingly
    if (typeof window !== "undefined" && window.nostr) {
      initializeNdkWithSigner();
    } else {
      initializeNdkWithoutSigner();
    }
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
