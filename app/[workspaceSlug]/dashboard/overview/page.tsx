"use client";

import { useAuth } from "../../../contexts/AuthContext";
import OverViewPage from "./_components/overview";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

export default function Page() {
  const { session, isLoading } = useAuth();
  const { workspaceSlug } = useParams();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!session) {
    return <div>Not authenticated</div>;
  }

  if (!workspaceSlug) {
    return <div>Workspace not found</div>;
  }

  return <OverViewPage workspaceSlug={workspaceSlug} />;
}
