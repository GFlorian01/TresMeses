import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getOrCreateDailyEntry } from "@/lib/queries";
import { HabitChecklist } from "@/components/check/habit-checklist";
import { MealTracker } from "@/components/check/meal-tracker";
import { ReadingTracker } from "@/components/check/reading-tracker";
import { GymToggle } from "@/components/check/gym-toggle";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarDays } from "lucide-react";

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

  const today = new Date().toISOString().split("T")[0];

  let entry;
  try {
    entry = await getOrCreateDailyEntry(user.id, today);
  } catch {
    // If DB operations fail, show a minimal page
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

  const formattedDate = format(
    new Date(today + "T12:00:00"),
    "EEEE d 'de' MMMM",
    { locale: es }
  );

  const habitsDone =
    entry.habit_checks?.filter((h: { completed: boolean }) => h.completed)
      .length ?? 0;
  const habitsTotal = entry.habit_checks?.length ?? 0;
  const mealsDone =
    entry.meal_entries?.filter((m: { completed: boolean }) => m.completed)
      .length ?? 0;
  const mealsTotal = entry.meal_entries?.length ?? 0;
  const hasReading = entry.reading_minutes > 0;
  const hasTraining = entry.is_gym_day || entry.is_recovery_day;

  const totalItems = habitsTotal + mealsTotal + 2;
  const completedItems =
    habitsDone + mealsDone + (hasReading ? 1 : 0) + (hasTraining ? 1 : 0);
  const progressPercent =
    totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto p-4 space-y-4">
        {/* Header */}
        <div className="pt-2 pb-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Hola,{" "}
                {user.user_metadata?.full_name?.split(" ")[0] ?? ""}
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-sm text-muted-foreground capitalize">
                  {formattedDate}
                </p>
              </div>
            </div>

            {/* Progress ring */}
            <div className="relative flex items-center justify-center w-14 h-14">
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-muted/50"
                />
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${progressPercent * 1.508} 150.8`}
                  className="text-primary transition-all duration-500"
                />
              </svg>
              <span className="absolute text-xs font-bold tabular-nums">
                {progressPercent}%
              </span>
            </div>
          </div>
        </div>

        <HabitChecklist checks={entry.habit_checks ?? []} />
        <GymToggle
          entryId={entry.id}
          isGymDay={entry.is_gym_day}
          isRecoveryDay={entry.is_recovery_day}
        />
        <MealTracker meals={entry.meal_entries ?? []} />
        <ReadingTracker
          entryId={entry.id}
          initialMinutes={entry.reading_minutes}
        />
      </div>
    </div>
  );
}
