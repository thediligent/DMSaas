import { Toaster } from '@/components/ui/sonner';
import type { Metadata } from 'next';
import { getSupabaseClient } from '@/utils/supabase/client';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import NextTopLoader from 'nextjs-toploader';
import { AuthProvider } from './contexts/AuthContext';
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
  const supabase = getSupabaseClient();
  let session = null;
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    session = data.session;
  } catch (error) {
    console.error('Error fetching session:', error);
  }
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={'overflow-hidden'}>
        <NextTopLoader showSpinner={false} />
        <AuthProvider>
          <Toaster />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
