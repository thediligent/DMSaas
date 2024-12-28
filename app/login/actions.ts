'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string
  };

  const { data: authData, error } =
    await supabase.auth.signInWithPassword(data);

  if (error) {
    // You might want to return the error instead of redirecting
    // This allows you to handle the error in the UI
    return { error: error.message };
  }

  if (authData.session) {
    // Add this to ensure the session is properly set
    await supabase.auth.setSession(authData.session);

    // Revalidate the new path
    revalidatePath('/[workspace]/dashboard/overview', 'layout');

    // Redirect to the dashboard
    redirect('/[workspace]/dashboard/overview');
  }
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string
  };

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    redirect('/error');
  }

  revalidatePath('/', 'layout');
  redirect('/');
}
