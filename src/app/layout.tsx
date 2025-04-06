// src/app/layout.tsx (Server Component)
import { headers } from 'next/headers';
import ClientProviders from '@/components/ClientProviders';
import NostrProvider from '@/components/NostrProvider';
import { use } from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = use(headers());
  const langHeader = headersList.get('x-lang') || 'en';

  return (
    <html lang={langHeader} suppressHydrationWarning>
      <body>
        <NostrProvider>
          <ClientProviders serverLang={langHeader}>
            {children}
          </ClientProviders>
        </NostrProvider>
      </body>
    </html>
  )
}
