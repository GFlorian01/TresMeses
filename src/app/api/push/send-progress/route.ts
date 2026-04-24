import { NextResponse } from "next/server";
import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";
import { getCurrentTimeStr, getTodayStr, getDaysAgoStr, DEFAULT_TIMEZONE } from "@/lib/date-utils";
import type { DailyEntry, HabitCheck, MealEntry } from "@/types/database";

export const dynamic = "force-dynamic";

let vapidConfigured = false;

function ensureVapid() {
  if (!vapidConfigured) {
    webpush.setVapidDetails(
      "mailto:noreply@tresmeses.app",
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    );
    vapidConfigured = true;
  }
}

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function isAround9PM(currentTime: string): boolean {
  const [h, m] = currentTime.split(":").map(Number);
  const mins = h * 60 + m;
  return Math.abs(mins - 21 * 60) <= 10;
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

function buildMessage(
  entry: (DailyEntry & { habit_checks: HabitCheck[]; meal_entries: MealEntry[] }) | null,
  streak: number
): { title: string; body: string } {
  if (!entry) {
    return {
      title: "TresMeses 📊",
      body: "No hay registro de hoy aún. ¡Abre la app y anota cómo fue tu día antes de dormir!",
    };
  }

  const score = calculateScore(entry);
  const habitsCompleted = entry.habit_checks.filter((h) => h.completed).length;
  const habitTotal = entry.habit_checks.length;
  const mealsCompleted = entry.meal_entries.filter((m) => m.completed).length;
  const mealTotal = entry.meal_entries.length;
  const gymStr = entry.is_gym_day
    ? " · 🏋️ gym"
    : entry.is_recovery_day
    ? " · 🧘 recup."
    : "";
  const readStr = entry.reading_minutes > 0 ? ` · 📚 ${entry.reading_minutes}min` : "";
  const streakStr = streak > 0 ? ` · 🔥 ${streak}d racha` : "";

  const scoreEmoji = score >= 80 ? "🌟" : score >= 60 ? "✅" : score >= 40 ? "📈" : "💡";

  return {
    title: "Resumen del día 📊",
    body: `${scoreEmoji} ${score}% · ${habitsCompleted}/${habitTotal} hábitos · ${mealsCompleted}/${mealTotal} comidas${gymStr}${readStr}${streakStr}`,
  };
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  ensureVapid();
  const supabase = getSupabaseAdmin();

  const { data: users } = await supabase.from("users").select("id, timezone");
  if (!users || users.length === 0) return NextResponse.json({ sent: 0 });

  const matchingUserIds: string[] = [];
  for (const u of users) {
    const tz = u.timezone ?? DEFAULT_TIMEZONE;
    if (isAround9PM(getCurrentTimeStr(tz))) {
      matchingUserIds.push(u.id);
    }
  }

  if (matchingUserIds.length === 0) return NextResponse.json({ sent: 0 });

  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("*")
    .in("user_id", matchingUserIds);

  if (!subs || subs.length === 0) return NextResponse.json({ sent: 0 });

  let sent = 0;
  const stale: string[] = [];

  for (const sub of subs) {
    const tz = users.find((u) => u.id === sub.user_id)?.timezone ?? DEFAULT_TIMEZONE;
    const today = getTodayStr(tz);

    const { data: entry } = await supabase
      .from("daily_entries")
      .select("*, habit_checks(*), meal_entries(*)")
      .eq("user_id", sub.user_id)
      .eq("date", today)
      .single();

    const streak = await getStreak(supabase, sub.user_id, tz);

    const { title, body } = buildMessage(
      entry as (DailyEntry & { habit_checks: HabitCheck[]; meal_entries: MealEntry[] }) | null,
      streak
    );

    const payload = JSON.stringify({ title, body, url: "/check" });

    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload
      );
      sent++;
    } catch (err: unknown) {
      const statusCode = (err as { statusCode?: number }).statusCode;
      if (statusCode === 410 || statusCode === 404) stale.push(sub.endpoint);
    }
  }

  if (stale.length > 0) {
    await supabase.from("push_subscriptions").delete().in("endpoint", stale);
  }

  return NextResponse.json({ sent, cleaned: stale.length });
}
