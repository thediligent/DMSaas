'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

type AuthContextType = {
  user: any;
  session: any;
  supabase: ReturnType<typeof createClientComponentClient>;
  isLoading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const {
          data: { session: existingSession },
          error
        } = await supabase.auth.getSession();
        if (error) throw error;

        if (existingSession) {
          setSession(existingSession);
          setUser(existingSession.user);

          // Fetch user's workspace
          const { data: workspaceUser } = await supabase
            .schema('base')
            .from('workspace_users')
            .select(
              `
              workspace_id,
              workspaces:workspace_id (
                slug
              )
            `
            )
            .eq('user_id', existingSession.user.id)
            .order('created_at', { ascending: true })
            .limit(1)
            .single();

          if (workspaceUser?.workspaces?.slug) {
            // Store workspace info in localStorage
            localStorage.setItem(
              'currentWorkspace',
              workspaceUser.workspaces.slug
            );
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Set up auth state change listener
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log('Auth state changed:', event);

      if (currentSession) {
        setSession(currentSession);
        setUser(currentSession.user);

        if (event === 'SIGNED_IN') {
          try {
            const { data: workspaceUser } = await supabase
              .schema('base')
              .from('workspace_users')
              .select(
                `
                  workspace_id,
                  workspaces:workspace_id (
                    slug
                  )
                `
              )
              .eq('user_id', currentSession.user.id)
              .order('created_at', { ascending: true })
              .limit(1)
              .single();

            if (workspaceUser?.workspaces?.slug) {
              const workspaceSlug = workspaceUser.workspaces.slug;
              localStorage.setItem('currentWorkspace', workspaceSlug);
              router.push(`/${workspaceSlug}/dashboard/overview`);
              router.refresh();
            }
          } catch (error) {
            console.error('Error fetching workspace:', error);
            toast.error('Error accessing workspace');
          }
        }
      } else {
        setSession(null);
        setUser(null);
        localStorage.removeItem('currentWorkspace');
        router.push('/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('currentWorkspace');
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Error signing out');
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, session, supabase, isLoading, signOut }}
    >
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
