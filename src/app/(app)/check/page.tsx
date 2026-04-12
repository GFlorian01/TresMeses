import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getOrCreateDailyEntry } from "@/lib/queries";
import { CheckPageClient } from "@/components/check/check-page-client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { getTodayStr, parseDateSafe, DEFAULT_TIMEZONE } from "@/lib/date-utils";

export default async function CheckPage() {
  const supabase = await createClient();

  let user;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    redirect("/login");
  }

  if (!user) redirect("/login");

  // Obtener timezone — query separada para no fallar si onboarding_complete no existe aún
  const { data: userRow } = await supabase
    .from("users")
    .select("timezone, onboarding_complete")
    .eq("id", user.id)
    .single();

  const tz = userRow?.timezone ?? DEFAULT_TIMEZONE;

  // Verificar onboarding: usar ciclo activo como fuente de verdad (no depende de la columna)
  if (!userRow?.onboarding_complete) {
    const { data: activeCycle } = await supabase
      .from("cycles")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .limit(1)
      .single();

    if (!activeCycle) redirect("/onboarding");
    // Si tiene ciclo, continuar — onboarding_complete se fijará cuando la migración se aplique
  }
  const today = getTodayStr(tz);

  let entry;
  try {
    entry = await getOrCreateDailyEntry(user.id, today);
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

  const formattedDate = format(parseDateSafe(today), "EEEE d 'de' MMMM", {
    locale: es,
  });

  return (
    <CheckPageClient
      userName={user.user_metadata?.full_name?.split(" ")[0] ?? ""}
      formattedDate={formattedDate}
      habitChecks={entry.habit_checks ?? []}
      entryId={entry.id}
      isGymDay={entry.is_gym_day}
      isRecoveryDay={entry.is_recovery_day}
      meals={entry.meal_entries ?? []}
      initialReadingMinutes={entry.reading_minutes}
      initialHasTraining={entry.is_gym_day || entry.is_recovery_day}
    />
  );
}
