"use client";

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";
import { useEffect } from "react";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";

export default function UserAuthForm() {
  const { supabase } = useAuth();
  const router = useRouter();

  const getUserWorkspace = async (userId: string) => {
    try {
      console.log("Fetching workspace for user:", userId);

      // First get the user's primary workspace
      const { data: workspaceUser, error: workspaceError } = await supabase
        .schema("base") // Specify the schema
        .from("workspace_users")
        .select(
          `
          workspace_id,
          workspaces:workspace_id (
            slug
          )
        `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: true })
        .limit(1)
        .single();

      console.log("Query response:", {
        data: workspaceUser,
        error: workspaceError
      });

      if (workspaceError) throw workspaceError;
      if (!workspaceUser) throw new Error("No workspace found");

      return workspaceUser.workspaces.slug;
    } catch (error) {
      console.error("Error fetching workspace:", error);

      // If we need to create a default workspace
      const { data: existingUser, error: userError } = await supabase
        .schema("base") // Specify the schema
        .from("users")
        .select("id")
        .eq("id", userId)
        .single();

      if (existingUser && !userError) {
        try {
          const { data: newWorkspace, error: createError } = await supabase
            .schema("base") // Specify the schema
            .from("workspaces")
            .insert([
              {
                name: "My Workspace",
                slug: `workspace-${userId.slice(0, 8)}`,
                extra_data: { size: "Small", industry: "Other" }
              }
            ])
            .select("id, slug")
            .single();

          if (createError) throw createError;

          // Associate user with the new workspace
          await supabase
            .schema("base") // Specify the schema
            .from("workspace_users")
            .insert([
              {
                workspace_id: newWorkspace.id,
                user_id: userId,
                extra_data: { joined_date: new Date().toISOString() }
              }
            ]);

          return newWorkspace.slug;
        } catch (createError) {
          console.error("Error creating default workspace:", createError);
        }
      }

      return null;
    }
  };
  useEffect(() => {
    let mounted = true;
    let authSubscription: { unsubscribe: () => void } | null = null;

    const handleAuthChange = async (
      event: AuthChangeEvent,
      session: Session | null
    ) => {
      if (!mounted) return;

      if (event === "SIGNED_IN" && session) {
        try {
          const workspaceSlug = await getUserWorkspace(session.user.id);
          if (!workspaceSlug) {
            toast.error("No workspace found");
            return;
          }

          localStorage.setItem("authjs.session-token", session.access_token);
          toast.success("Logged in successfully");

          // Use replace instead of push to prevent back navigation to login
          await router.replace(`/${workspaceSlug}/dashboard/overview`);
        } catch (error) {
          console.error("Login redirect error:", error);
          toast.error("Error during login redirect");
          await router.replace("/login");
        }
      }
    };

    // Setup auth listener
    const setupAuthListener = async () => {
      const {
        data: { subscription }
      } = supabase.auth.onAuthStateChange(handleAuthChange);
      authSubscription = subscription;
    };

    setupAuthListener();

    return () => {
      mounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, [supabase, router]);

  return (
    <div>
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={["google", "github"]}
        redirectTo="/login"
        magicLink={true}
        view="sign_in"
      />
    </div>
  );
}
