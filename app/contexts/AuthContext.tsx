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
        const {
          data: { session: existingSession },
          error
        } = await supabase.auth.getSession();
        if (error) throw error;

        if (existingSession) {
          setSession(existingSession);
          setUser(existingSession.user);
          console.log("User (existingSession.user) :", existingSession.user); // Log user information
          console.log("Session on login:", existingSession); // Log session
          await fetchWorkspace(existingSession.user.id);
          localStorage.setItem(
            "currentWorkspace",
            existingSession.user.workspaces
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
          // Fetch workspace when user signs in
          await fetchWorkspace(currentSession.user.id);
        } else {
          setSession(null);
          localStorage.removeItem("currentWorkspace");
          setUser(null);
          router.push("/login");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase, router]);

  const fetchWorkspace = async (userId: string) => {
    try {
      const { data: workspaces, error } = await supabase
        .schema("base")
        .from("workspace_users")
        .select(
          `
            workspaces:workspace_id (name, slug)
          `
        )
        .eq("user_id", userId);

      console.log("Fetched workspaces:", workspaces);
      if (error) throw error;
      // Check if workspaces array is returned and has items
      if (workspaces && workspaces.length > 0) {
        // Store all workspaces in local storage
        localStorage.setItem("userWorkspaces", JSON.stringify(workspaces));

        // Select the first workspace and store its slug
        const firstWorkspace = workspaces[0].workspaces; // Ensure this is defined

        if (firstWorkspace && firstWorkspace.slug) {
          localStorage.setItem("currentWorkspace", firstWorkspace.slug);
          console.log("Selected Workspace:", firstWorkspace.slug); // Log workspace information
          console.log(
            "Redirecting to workspace:",
            firstWorkspace.slug + "/dashboard/overview"
          );
          router.push(`/${firstWorkspace.slug}/dashboard/overview`);
        } else {
          console.error("First workspace or slug is undefined");
        }
      } else {
        console.error("No workspaces found for user");
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
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
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
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
