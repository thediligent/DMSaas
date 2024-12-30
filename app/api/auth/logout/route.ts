import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = createRouteHandlerClient({ cookies });

  // Sign out from Supabase
  const { error } = await supabase.auth.signOut();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Clear cookies
  const cookieStore = await cookies();
  cookieStore.getAll().forEach((cookie: { name: string }) => {
    cookieStore.delete(cookie.name);
  });

  return NextResponse.json({ success: true }, { status: 200 });
}
