"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getSupabaseClient } from "../../utils/supabase/client";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";

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
        console.log("Checking session...");
        const sessionToken = sessionStorage.getItem("authjs.session-token");
        console.log("Session token from sessionStorage:", sessionToken);

        const {
          data: { session: existingSession },
          error
        } = await supabase.auth.getSession();

        console.log("Session check result:", {
          existingSession: {
            ...existingSession,
            user: existingSession
              ? {
                  id: existingSession.user?.id,
                  email: existingSession.user?.email
                }
              : null
          },
          error
        });

        if (error) {
          console.error("Session check error:", error);
          throw error;
        }

        if (existingSession) {
          console.log("Valid session found:", {
            ...existingSession,
            user: {
              id: existingSession.user?.id,
              email: existingSession.user?.email
            }
          });
          setSession(existingSession);
          setUser(existingSession.user);
          console.log("User:", {
            id: existingSession.user?.id,
            email: existingSession.user?.email
          });

          // Verify session token storage
          const storedToken = sessionStorage.getItem("authjs.session-token");
          console.log("Stored session token:", storedToken);

          await fetchWorkspace(existingSession.user.id);

          // Verify workspace storage
          const storedWorkspace = localStorage.getItem("currentWorkspace");
          console.log("Stored workspace:", storedWorkspace);
        } else if (sessionToken) {
          console.log(
            "No session found but token exists, attempting to refresh session"
          );
          const { data: refreshedSession, error: refreshError } =
            await supabase.auth.refreshSession();
          if (refreshError) {
            console.error("Session refresh error:", refreshError);
            throw refreshError;
          }
          if (refreshedSession.session) {
            console.log(
              "Session refreshed successfully:",
              refreshedSession.session
            );
            setSession(refreshedSession.session);
            setUser(refreshedSession.user);
            await fetchWorkspace(refreshedSession.user.id);
          }
        } else {
          console.log(
            "No valid session found and no session token in sessionStorage"
          );
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Listen for auth state changes
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, currentSession: Session | null) => {
        console.log("Auth state changed:", event);

        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          sessionStorage.setItem(
            "authjs.session-token",
            currentSession.access_token
          );
          // Fetch workspace when user signs in
          await fetchWorkspace(currentSession.user.id);
        } else {
          setSession(null);
          localStorage.removeItem("currentWorkspace");
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase, router]);

  const fetchWorkspace = async (userId: string) => {
    try {
      console.log("Fetching workspaces for user:", userId);
      const { data: workspaces, error } = await supabase
        .schema("base")
        .from("workspace_users")
        .select(
          `
              workspaces:workspace_id (name, slug)
            `
        )
        .eq("user_id", userId);

      console.log("Workspaces query result:", { workspaces, error });

      if (error) {
        console.error("Workspaces query error:", error);
        throw error;
      }

      if (workspaces && workspaces.length > 0) {
        console.log("Workspaces found:", workspaces);
        // Store all workspaces in local storage
        localStorage.setItem("userWorkspaces", JSON.stringify(workspaces));

        // Select the first workspace and store its slug
        const firstWorkspace = workspaces[0].workspaces;
        console.log("First workspace:", firstWorkspace);

        if (firstWorkspace && firstWorkspace.slug) {
          console.log("Setting current workspace to:", firstWorkspace.slug);
          localStorage.setItem("currentWorkspace", firstWorkspace.slug);
          const redirectPath = `/${firstWorkspace.slug}/dashboard/overview`;
          console.log("Attempting redirect to:", redirectPath);
          try {
            await router.push(redirectPath);
            console.log("Redirect successful");
          } catch (error) {
            console.error("Redirect failed:", error);
            // Fallback to a safe route if redirect fails
            router.push("/dashboard");
          }
        } else {
          console.error("First workspace or slug is undefined");
        }
      } else {
        console.warn("No workspaces found for user");
        // If no workspaces found, redirect to a default page
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error fetching workspace:", error);
      toast.error("Error accessing workspace");
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      localStorage.removeItem("currentWorkspace");
      sessionStorage.removeItem("authjs.session-token");
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, session, supabase, isLoading, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
