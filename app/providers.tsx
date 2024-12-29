'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';

type AuthContextType = {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  signIn: (email: string, password: string) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType>({
  isLoading: true,
  isAuthenticated: false,
  user: null,
  signIn: () => {},
  signOut: () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    // Check initial auth state
    supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
      setIsAuthenticated(!!currentUser);
      setUser(currentUser);
      setIsLoading(false);

      if (currentUser) {
        supabase
          .from('workspace_users')
          .select(
            `
            workspace_id,
            workspaces:workspace_id (
              slug
            )
          `
          )
          .eq('user_id', currentUser.id)
          .single()
          .then(({ data: workspaceUser }) => {
            if (workspaceUser?.workspaces?.slug) {
              router.push(
                `/${workspaceUser.workspaces.slug}/dashboard/overview`
              );
            }
          })
          .catch((error) => {
            console.error('Error fetching workspace:', error);
          });
      }
    });

    // Subscribe to auth changes
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      const currentUser = session?.user;
      setIsAuthenticated(!!currentUser);
      setUser(currentUser);

      if (currentUser) {
        supabase
          .from('workspace_users')
          .select(
            `
            workspace_id,
            workspaces:workspace_id (
              slug
            )
          `
          )
          .eq('user_id', currentUser.id)
          .single()
          .then(({ data: workspaceUser }) => {
            if (workspaceUser?.workspaces?.slug) {
              router.push(
                `/${workspaceUser.workspaces.slug}/dashboard/overview`
              );
            }
          })
          .catch((error) => {
            console.error('Error fetching workspace:', error);
          });
      } else if (event === 'SIGNED_OUT') {
        router.push('/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  const signIn = (email: string, password: string) => {
    setIsLoading(true);
    supabase.auth
      .signInWithPassword({
        email,
        password
      })
      .then(({ data, error }) => {
        if (error) throw error;
        setUser(data.user);
        setIsAuthenticated(true);
      })
      .catch((error) => {
        console.error('Error signing in:', error);
        throw error;
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const signOut = () => {
    supabase.auth
      .signOut()
      .then(() => {
        setUser(null);
        setIsAuthenticated(false);
        router.push('/login');
      })
      .catch((error) => {
        console.error('Error signing out:', error);
      });
  };

  return (
    <AuthContext.Provider
      value={{ isLoading, isAuthenticated, user, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
