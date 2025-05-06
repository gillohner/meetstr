// src/app/layout.tsx (Server Component)
import { headers } from 'next/headers';
import ClientProviders from '@/providers/ClientProviders';
import { use } from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = use(headers());
  const langHeader = headersList.get('x-lang') || 'en';

  return (
    <html lang={langHeader} suppressHydrationWarning>
      <body>
        <ClientProviders serverLang={langHeader}>
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}
