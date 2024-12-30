"use client";

import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useParams } from "next/navigation";

export default function WorkspaceLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const params = useParams<{ workspaceSlug: string }>();
  const workspaceSlug = params.workspaceSlug;
  const { session, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const verifyWorkspaceAccess = async () => {
      if (!isLoading && session) {
        // Verify workspace access
        const storedWorkspace = localStorage.getItem("currentWorkspace");
        if (storedWorkspace !== workspaceSlug) {
          router.push(`/${storedWorkspace}/dashboard/overview`);
        }
      }
    };

    verifyWorkspaceAccess();
  }, [session, isLoading, workspaceSlug, router]);

  return <ProtectedRoute>{children}</ProtectedRoute>;
}
