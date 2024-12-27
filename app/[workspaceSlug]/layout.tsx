import { createServerComponentClient } from '@supabase/nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

interface WorkspaceLayoutProps {
  children: React.ReactNode;
  params: { workspaceSlug: string };
}

export default async function WorkspaceLayout({
  children,
  params
}: WorkspaceLayoutProps) {
  const supabase = createServerComponentClient({ cookies });
  const { workspaceSlug } = params;

  // Check if user is authenticated
  const {
    data: { session }
  } = await supabase.auth.getSession();
  if (!session) {
    redirect('/login');
  }

  // Fetch workspace data
  const { data: workspace, error: workspaceError } = await supabase
    .from('workspaces')
    .select('*')
    .eq('slug', workspaceSlug)
    .single();

  if (workspaceError || !workspace) {
    redirect('/404');
  }

  // Check if user has access to the workspace
  const { data: workspaceUser, error: workspaceUserError } = await supabase
    .from('workspace_users')
    .select('*')
    .eq('workspace_id', workspace.id)
    .eq('user_id', session.user.id)
    .single();

  if (workspaceUserError || !workspaceUser) {
    redirect('/dms/dashboard'); // Redirect to a default dashboard or access denied page
  }

  return (
    <div>
      <h1>{workspace.name}</h1>
      {children}
    </div>
  );
}
