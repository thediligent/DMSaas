import Providers from '@/components/layout/providers';
import { Toaster } from '@/components/ui/sonner';
import type { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import NextTopLoader from 'nextjs-toploader';
import './globals.css';

export const metadata: Metadata = {
  title: 'Diligent Marketing Engine',
  description: 'Launch your efforts with DME'
};
export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  let session;
  try {
    const { data } = await supabase.auth.getSession();
    session = data.session;
  } catch (error) {
    console.error('Error fetching session:', error);
  }

  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={'overflow-hidden'}>
        <NextTopLoader showSpinner={false} />
        <Providers>
          <Toaster />
          {children}
        </Providers>
      </body>
    </html>
  );
}
