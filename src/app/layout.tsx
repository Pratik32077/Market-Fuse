import '@/styles/globals.css';
import { Metadata } from 'next';
import { createServerComponentSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { ReactNode } from 'react';
// Removed custom local font loading to avoid missing font files.
// Using default system font stack via Tailwind's `font-sans`.

export const metadata: Metadata = {
  title: 'MarketFuse Custom Orders',
  description: 'Order intake and fulfillment for made‑to‑order sellers',
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = createServerComponentSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();

  return (
    <html
      lang="en"
      className={`h-full bg-[#F7F8FA] ${geistSans.variable} ${geistMono.variable}`}
    >
      <head />
      <body className="h-full antialiased">
        <SessionContextProvider supabaseClient={supabase} initialSession={session}>
          {children}
        </SessionContextProvider>
      </body>
    </html>
  );
}

