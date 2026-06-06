import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import {
  getTodayStr,
  getDaysAgoStr,
  DEFAULT_TIMEZONE,
} from "@/lib/date-utils";
import { buildEveningEmail } from "@/lib/email-templates";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { DailyEntry, HabitCheck, MealEntry } from "@/types/database";

export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tresmeses.app";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "TresMeses <noreply@tresmeses.app>";
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function calculateScore(
  entry: DailyEntry & { habit_checks: HabitCheck[]; meal_entries: MealEntry[] }
): number {
  let total = 0;
  let completed = 0;
  entry.habit_checks.forEach((hc) => { total++; if (hc.completed) completed++; });
  entry.meal_entries.forEach((me) => { total++; if (me.completed) completed++; });
  total++; if (entry.reading_minutes > 0) completed++;
  total++; if (entry.is_gym_day || entry.is_recovery_day) completed++;
  return total === 0 ? 0 : Math.round((completed / total) * 100);
}

async function getStreak(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  userId: string,
  tz: string
): Promise<number> {
  const { data: entries } = await supabase
    .from("daily_entries")
    .select("date, habit_checks(*), meal_entries(*), is_gym_day, is_recovery_day, reading_minutes")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .limit(30);

  if (!entries || entries.length === 0) return 0;

  let streak = 0;
  for (let i = 0; i < 30; i++) {
    const dateStr = getDaysAgoStr(i, tz);
    const entry = entries.find((e) => e.date === dateStr);
    if (!entry) break;
    const score = calculateScore(
      entry as DailyEntry & { habit_checks: HabitCheck[]; meal_entries: MealEntry[] }
    );
    if (score >= 70) streak++;
    else break;
  }
  return streak;
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const supabase = getSupabaseAdmin();

  const { data: prefs } = await supabase
    .from("email_preferences")
    .select("user_id, evening_sent_date")
    .eq("evening_enabled", true);

  if (!prefs || prefs.length === 0) return NextResponse.json({ sent: 0 });

  const userIds = prefs.map((p) => p.user_id);
  const { data: users } = await supabase
    .from("users")
    .select("id, email, name, timezone")
    .in("id", userIds);

  if (!users || users.length === 0) return NextResponse.json({ sent: 0 });

  let sent = 0;

  for (const pref of prefs) {
    const user = users.find((u) => u.id === pref.user_id);
    if (!user?.email) continue;

    const tz = user.timezone ?? DEFAULT_TIMEZONE;
    const today = getTodayStr(tz);

    if (pref.evening_sent_date === today) continue;

    const { data: entry } = await supabase
      .from("daily_entries")
      .select("*, habit_checks(*), meal_entries(*)")
      .eq("user_id", user.id)
      .eq("date", today)
      .single();

    const streak = await getStreak(supabase, user.id, tz);
    const firstName = user.name?.split(" ")[0] ?? "Campeón";
    const formattedDate = format(new Date(today + "T12:00:00"), "EEEE d 'de' MMMM", { locale: es });

    let score = 0;
    let habitsDone = 0;
    let habitsTotal = 0;
    let mealsDone = 0;
    let mealsTotal = 0;
    let hasReading = false;
    let hasTraining = false;

    if (entry) {
      const e = entry as DailyEntry & { habit_checks: HabitCheck[]; meal_entries: MealEntry[] };
      score = calculateScore(e);
      habitsDone = e.habit_checks.filter((h) => h.completed).length;
      habitsTotal = e.habit_checks.length;
      mealsDone = e.meal_entries.filter((m) => m.completed).length;
      mealsTotal = e.meal_entries.length;
      hasReading = e.reading_minutes > 0;
      hasTraining = e.is_gym_day || e.is_recovery_day;
    }

    const html = buildEveningEmail({
      name: firstName,
      formattedDate,
      score,
      habitsDone,
      habitsTotal,
      mealsDone,
      mealsTotal,
      hasReading,
      hasTraining,
      streak,
      appUrl: APP_URL,
    });

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: user.email,
      subject: `Tu día hoy: ${score}% ${score >= 80 ? "🌟" : score >= 60 ? "✅" : "📈"} — ${firstName}`,
      html,
    });

    if (!error) {
      sent++;
      await supabase
        .from("email_preferences")
        .update({ evening_sent_date: today })
        .eq("user_id", user.id);
    }
  }

  return NextResponse.json({ sent });
}
