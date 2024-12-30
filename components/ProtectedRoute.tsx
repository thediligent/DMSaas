"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../app/contexts/AuthContext";
import { toast } from "sonner";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";

export default function ProtectedRoute({
  children
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, session } = useAuth();
  const router = useRouter();
  const [initialCheckComplete, setInitialCheckComplete] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkSession = () => {
      if (!isMounted) return;

      if (session) {
        setHasSession(true);
        setInitialCheckComplete(true);
        return;
      }

      const sessionToken = localStorage.getItem("authjs.session-token");

      if (sessionToken) {
        setHasSession(true);
      } else {
        router.push("/login");
      }

      setInitialCheckComplete(true);
    };

    // Check session immediately
    checkSession();

    // Also check after a short delay to catch any async updates
    const timeout = setTimeout(() => {
      checkSession();
    }, 100);

    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, [session, router]);

  const { supabase } = useAuth();

  // Listen for auth state changes
  useEffect(() => {
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        if (session) {
          setHasSession(true);
        } else {
          setHasSession(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  if (isLoading || !initialCheckComplete) {
    return <div>Loading...</div>;
  }

  if (!hasSession) {
    return null;
  }

  return <>{children}</>;
}
