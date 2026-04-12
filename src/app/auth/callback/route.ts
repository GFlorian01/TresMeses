import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncUser, getHabits, createDefaultHabits } from "@/lib/queries";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/check";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Sync user to our database
      await syncUser(data.user);

      // Create default habits if first time, then redirect to onboarding
      const habits = await getHabits(data.user.id);
      if (habits.length === 0) {
        await createDefaultHabits(data.user.id);
        return NextResponse.redirect(`${origin}/onboarding`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
