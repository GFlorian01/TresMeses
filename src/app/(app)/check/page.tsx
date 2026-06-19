import { getUser, getUserRow } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getOrCreateDailyEntry, getActiveCycle } from "@/lib/queries";
import { CheckPageClient } from "@/components/check/check-page-client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { getTodayStr, parseDateSafe, DEFAULT_TIMEZONE } from "@/lib/date-utils";

export default async function CheckPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const user = await getUser();
  if (!user) redirect("/login");

  // getUserRow y getActiveCycle usan cache() — sin round-trips extra si el layout ya los llamó
  const userRow = await getUserRow(user.id);
  const tz = userRow?.timezone ?? DEFAULT_TIMEZONE;

  if (!userRow?.onboarding_complete) {
    const activeCycle = await getActiveCycle(user.id);
    if (!activeCycle) redirect("/onboarding");
  }

  const today = getTodayStr(tz);

  // Validar fecha del search param — no permitir fechas futuras
  const params = await searchParams;
  const requestedDate = params.date;
  const dateStr =
    requestedDate && /^\d{4}-\d{2}-\d{2}$/.test(requestedDate) && requestedDate <= today
      ? requestedDate
      : today;

  let entry;
  try {
    entry = await getOrCreateDailyEntry(user.id, dateStr);
  } catch {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="max-w-lg mx-auto p-4">
          <h1 className="text-xl font-bold pt-2">Check diario</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Error al cargar datos. Ve a Config para crear tu ciclo y habitos.
          </p>
        </div>
      </div>
    );
  }

  if (!entry) redirect("/login");

  const formattedDate = format(parseDateSafe(dateStr), "EEEE d 'de' MMMM", {
    locale: es,
  });

  return (
    <CheckPageClient
      key={dateStr}
      userName={(userRow?.name ?? user.user_metadata?.full_name ?? "").split(" ")[0]}
      formattedDate={formattedDate}
      habitChecks={entry.habit_checks ?? []}
      entryId={entry.id}
      isGymDay={entry.is_gym_day}
      isRecoveryDay={entry.is_recovery_day}
      meals={entry.meal_entries ?? []}
      initialReadingMinutes={entry.reading_minutes}
      initialHasTraining={entry.is_gym_day || entry.is_recovery_day}
      dateStr={dateStr}
      todayStr={today}
    />
  );
}
