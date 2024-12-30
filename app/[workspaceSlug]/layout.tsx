"use client";

import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";

export default function WorkspaceLayout({
  children,
  params: { workspaceSlug }
}: {
  children: React.ReactNode;
  params: { workspaceSlug: string };
}) {
  const { session, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && session) {
      // Verify workspace access
      const storedWorkspace = localStorage.getItem("currentWorkspace");
      if (storedWorkspace !== workspaceSlug) {
        router.push(`/${storedWorkspace}/dashboard/overview`);
      }
    }
  }, [session, isLoading, workspaceSlug, router]);

  return <ProtectedRoute>{children}</ProtectedRoute>;
}
