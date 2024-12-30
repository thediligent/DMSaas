"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../app/contexts/AuthContext";
import { toast } from "sonner";

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
    if (!isLoading) {
      if (session) {
        setHasSession(true);
        setInitialCheckComplete(true);
      } else {
        console.log("No session found, checking localStorage for token");
        const sessionToken = localStorage.getItem("authjs.session-token");

        if (sessionToken) {
          console.log("Session token found, waiting for session refresh");
          // Wait a bit longer for session refresh
          setTimeout(() => {
            if (!session) {
              console.log("Session refresh failed, redirecting to login");
              toast.error("Session expired, please login again");
              router.push("/login");
            }
          }, 1000);
        } else {
          console.log("No session token found, redirecting to login");
          router.push("/login");
        }
        setInitialCheckComplete(true);
      }
    }
  }, [session, isLoading, router]);

  if (isLoading || !initialCheckComplete) {
    return <div>Loading...</div>;
  }

  if (!hasSession) {
    return null;
  }

  return <>{children}</>;
}
