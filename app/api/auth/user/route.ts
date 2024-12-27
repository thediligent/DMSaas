import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase';

export async function GET(request: Request) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user }
  } = await supabase.auth.getUser();
  return Response.json({ user });
}
