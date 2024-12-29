"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../app/contexts/AuthContext";

export default function ProtectedRoute({
  children
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, session } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !session) {
      router.push("/login");
    }
    console.log("protectedroute session:" + session);
  }, [session, isLoading, router]);

  if (isLoading) {
    return <div>Loading...</div>; // Or your loading component
  }

  return session ? <>{children}</> : null;
}
