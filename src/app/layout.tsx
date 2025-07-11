import { headers } from "next/headers";
import ClientProviders from "@/providers/ClientProviders";
import type { Metadata } from "next";

// Base metadata for the application
export const metadata: Metadata = {
  metadataBase: new URL("https://meetstr.com"),
  title: {
    default: "Meetstr - Nostr Calendar Events",
    template: "%s | Meetstr",
  },
  description:
    "Discover, view, and manage NIP-52 based calendar events on the decentralized Nostr network.",
  keywords: [
    "nostr",
    "calendar",
    "events",
    "decentralized",
    "NIP-52",
    "meetups",
    "bitcoin",
  ],
  authors: [{ name: "Meetstr", url: "https://meetstr.com" }],
  creator: "Meetstr",
  publisher: "Meetstr",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://meetstr.com",
    siteName: "Meetstr",
    title: "Meetstr - Nostr Calendar Events",
    description:
      "Discover, view, and manage NIP-52 based calendar events on the decentralized Nostr network.",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "Meetstr - Nostr Calendar Events",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Meetstr - Nostr Calendar Events",
    description:
      "Discover, view, and manage NIP-52 based calendar events on the decentralized Nostr network.",
    creator: "@meetstr",
    images: ["/og-default.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const langHeader = headersList.get("x-lang") || "en";

  return (
    <html lang={langHeader} suppressHydrationWarning>
      <head />
      <body suppressHydrationWarning>
        <ClientProviders serverLang={langHeader}>{children}</ClientProviders>
      </body>
    </html>
  );
}
