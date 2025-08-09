// src/providers/ClientProviders.tsx
"use client";

import { type ReactNode, useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import { ThemeProvider } from "@mui/material/styles";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { initI18n } from "@/lib/i18n";
import theme from "@/theme";
import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";
import AppLayout from "@/components/common/layout/AppLayout";
import CssBaseline from "@mui/material/CssBaseline";
import { useNdk } from "nostr-hooks";
import { SnackbarProvider } from "@/context/SnackbarContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useLanguageSync } from "@/hooks/useLanguageSync";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (was cacheTime)
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: (failureCount, error) => {
        // Don't retry on 404s or auth errors
        if (error && typeof error === "object" && "status" in error) {
          if ((error as any).status === 404 || (error as any).status === 401) {
            return false;
          }
        }
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
});

function ProviderContent({ children }: { children: ReactNode }) {
  const { initNdk, ndk } = useNdk();
  const [nostrLoginReady, setNostrLoginReady] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Prevent hydration mismatch by only rendering on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Sync language preferences after hydration
  useLanguageSync();

  // Initialize nostr-login with floating manager (like nostr.band)
  useEffect(() => {
    if (!isClient) return; // Only run on client side

    import("nostr-login")
      .then(async ({ init }) => {
        init({
          bunkers: "nsec.app,highlighter.com,amber.app",
          theme: "default",
          darkMode: false,
          perms: "sign_event:1,nip04_encrypt,nip04_decrypt",
          noBanner: false,
          methods: ["connect", "extension", "readOnly", "local"],
          onAuth: async (npub, options) => {
            console.log("User authenticated:", npub, options);
            // Re-initialize NDK with the new signer
            setTimeout(async () => {
              await initializeNdkWithSigner();
            }, 200);
          },
        });
        setNostrLoginReady(true);
      })
      .catch((error) => console.log("Failed to load nostr-login", error));
  }, [isClient]);

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
    if (!nostrLoginReady || !isClient) return;

    // Check if user is already logged in and initialize accordingly
    if (typeof window !== "undefined" && window.nostr) {
      initializeNdkWithSigner();
    } else {
      initializeNdkWithoutSigner();
    }
  }, [initNdk, nostrLoginReady, isClient]);

  useEffect(() => {
    if (!ndk) return;
    ndk.connect();
  }, [ndk]);

  return (
    <SnackbarProvider>
      <AppLayout>{children}</AppLayout>
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
