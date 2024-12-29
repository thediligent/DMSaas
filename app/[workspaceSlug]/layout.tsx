import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
// import ProtectedRoute from '@/components/ProtectedRoute';

export default async function WorkspaceLayout({
  children,
  params: { workspaceSlug }
}: {
  children: React.ReactNode;
  params: { workspaceSlug: string };
}) {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  // Verify workspace access
  const { data: workspace } = await supabase
    .schema('base')
    .from('workspaces')
    .select('id')
    .eq('slug', workspaceSlug)
    .single();

  if (!workspace) {
    redirect('/404');
  }

  // Verify user has access to workspace
  const { data: workspaceUser } = await supabase
    .schema('base')
    .from('workspace_users')
    .select('workspace_id')
    .eq('workspace_id', workspace.id)
    .eq('user_id', session.user.id)
    .single();

  if (!workspaceUser) {
    redirect('/403');
  }

  // return <ProtectedRoute>{children}</ProtectedRoute>;
  return { children };
}
