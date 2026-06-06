import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import {
  getTodayStr,
  getDaysAgoStr,
  getWeekStartStr,
  DEFAULT_TIMEZONE,
} from "@/lib/date-utils";
import { buildWeeklyEmail } from "@/lib/email-templates";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { DailyEntry, HabitCheck, MealEntry } from "@/types/database";

export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tresmeses.app";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "TresMeses <noreply@tresmeses.app>";
const DAY_LABELS = ["L", "M", "X", "J", "V", "S", "D"];

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function isSunday(tz: string): boolean {
  const formatter = new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "short" });
  return formatter.format(new Date()) === "Sun";
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
    .select("user_id, weekly_sent_date")
    .eq("weekly_enabled", true);

  if (!prefs || prefs.length === 0) return NextResponse.json({ sent: 0 });

  const userIds = prefs.map((p) => p.user_id);
  const { data: users } = await supabase
    .from("users")
    .select("id, email, name")
    .in("id", userIds);

  if (!users || users.length === 0) return NextResponse.json({ sent: 0 });

  let sent = 0;

  for (const pref of prefs) {
    const user = users.find((u) => u.id === pref.user_id);
    if (!user?.email) continue;

    const tz = DEFAULT_TIMEZONE;
    const today = getTodayStr(tz);

    // Solo domingos + sin duplicados
    if (!isSunday(tz)) continue;
    if (pref.weekly_sent_date === today) continue;

    // Obtener datos de la semana (lunes a domingo)
    const weekStart = getWeekStartStr(tz);
    const weekStartDate = new Date(weekStart + "T12:00:00");

    const weekDates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStartDate);
      d.setDate(d.getDate() + i);
      return d.toISOString().split("T")[0];
    });

    const { data: weekEntries } = await supabase
      .from("daily_entries")
      .select("*, habit_checks(*), meal_entries(*)")
      .eq("user_id", user.id)
      .in("date", weekDates);

    const days = weekDates.map((dateStr, i) => {
      const entry = (weekEntries ?? []).find((e) => e.date === dateStr);
      const score = entry
        ? calculateScore(entry as DailyEntry & { habit_checks: HabitCheck[]; meal_entries: MealEntry[] })
        : null;
      return { label: DAY_LABELS[i], score };
    });

    const scores = days.filter((d) => d.score !== null).map((d) => d.score as number);
    const weeklyAvg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    const gymDays = (weekEntries ?? []).filter(
      (e) => (e as DailyEntry).is_gym_day || (e as DailyEntry).is_recovery_day
    ).length;
    const readingDays = (weekEntries ?? []).filter((e) => (e as DailyEntry).reading_minutes > 0).length;
    const streak = await getStreak(supabase, user.id, tz);

    // Semana del ciclo
    const { data: cycle } = await supabase
      .from("cycles")
      .select("start_date")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    let cycleWeek = 1;
    if (cycle) {
      const startDate = new Date(cycle.start_date + "T12:00:00");
      const todayDate = new Date(today + "T12:00:00");
      const diffDays = Math.floor((todayDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      cycleWeek = Math.min(12, Math.max(1, Math.floor(diffDays / 7) + 1));
    }

    const firstName = user.name?.split(" ")[0] ?? "Campeón";
    const weekLabel = format(weekStartDate, "'Semana del' d 'de' MMMM", { locale: es });

    const html = buildWeeklyEmail({
      name: firstName,
      weekLabel,
      days,
      weeklyAvg,
      gymDays,
      readingDays,
      streak,
      cycleWeek,
      appUrl: APP_URL,
    });

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: user.email,
      subject: `Tu semana: ${weeklyAvg}% promedio ${weeklyAvg >= 70 ? "🌟" : "📈"} — ${firstName}`,
      html,
    });

    if (!error) {
      sent++;
      await supabase
        .from("email_preferences")
        .update({ weekly_sent_date: today })
        .eq("user_id", user.id);
    }
  }

  return NextResponse.json({ sent });
}
