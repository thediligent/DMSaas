'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getSupabaseClient } from '@/utils/supabase/client';

type AuthContextType = {
  user: any;
  session: any;
  supabase: ReturnType<typeof getSupabaseClient>;
  isLoading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = getSupabaseClient();
  const router = useRouter();

  // Check for existing session on mount
  useEffect(() => {
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
          console.log('User (existingSession.user) :', existingSession.user); // Log user information
          await fetchWorkspace(existingSession.user.id);
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Listen for auth state changes
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log('Auth state changed:', event);

      if (currentSession) {
        setSession(currentSession);
        setUser(currentSession.user);
        console.log('User (currentSession.user) :', currentSession.user); // Log user information

        if (event === 'SIGNED_IN') {
          await fetchWorkspace(currentSession.user.id);
          const workspaceSlug = localStorage.getItem('currentWorkspace');
          if (workspaceSlug) {
            router.push(`/${workspaceSlug}/dashboard/overview`);
          }
        }
      } else {
        setSession(null);
        setUser(null);
        localStorage.removeItem('currentWorkspace');
        router.push('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, router]);

  const fetchWorkspace = async (userId: string) => {
    try {
      const { data: workspaceUser, error } = await supabase
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
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (error) throw error;

      if (workspaceUser?.workspaces?.slug) {
        localStorage.setItem('currentWorkspace', workspaceUser.workspaces.slug);
        console.log('Workspace:', workspaceUser.workspaces.slug); // Log workspace information
      }
    } catch (error) {
      console.error('Error fetching workspace:', error);
      toast.error('Error accessing workspace');
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      localStorage.removeItem('currentWorkspace');
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
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
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
