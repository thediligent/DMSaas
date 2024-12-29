'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { getSupabaseClient } from '@/utils/supabase/client'; // Adjust the import path as needed

export default function Dashboard() {
  const { session, isLoading } = useAuth();
  const router = useRouter();
  const supabase = getSupabaseClient();

  useEffect(() => {
    const fetchWorkspace = async () => {
      if (!session) {
        router.push('/login');
        return;
      }

      // Fetch the user's workspace
      const { data, error } = await supabase
        .schema('base')
        .from('workspace_users')
        .select('workspaces(slug)')
        .eq('user_id', session.user.id)
        .single();
      console.log(data);

      if (error) {
        console.error('Error fetching workspace:', error);
        return;
      }

      if (data?.workspaces?.slug) {
        router.push(`/${data.workspaces.slug}/dashboard/overview`);
      } else {
        console.error('No workspace found for user');
      }
    };

    if (!isLoading) {
      fetchWorkspace();
    }
  }, [session, isLoading, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <div>Welcome to the Dashboard! Please wait...</div>; // Placeholder content
}
