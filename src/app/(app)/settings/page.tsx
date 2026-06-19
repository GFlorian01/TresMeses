import { createClient, getUser, getUserRow } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getActiveCycle } from "@/lib/queries";
import { CycleForm } from "@/components/settings/cycle-form";
import { HabitManager } from "@/components/settings/habit-manager";
import { PauseCycleCard } from "@/components/settings/pause-cycle-card";
import { RestartCycleCard } from "@/components/settings/restart-cycle-card";
import { Button } from "@/components/ui/button";
import { ProfileCard } from "@/components/settings/profile-card";
import { signOutAction } from "./actions";
import { Settings, LogOut } from "lucide-react";
import { NotificationCard } from "@/components/settings/notification-card";
import { TimezoneCard } from "@/components/settings/timezone-card";
import { EmailCard } from "@/components/settings/email-card";
import { DEFAULT_TIMEZONE } from "@/lib/date-utils";

export default async function SettingsPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  // Estas dos usan cache() — sin round-trips extra si el layout ya las llamó
  const supabase = await createClient();

  const [activeCycle, userRow, { data: allHabits }, { data: emailPrefs }] = await Promise.all([
    getActiveCycle(user.id),
    getUserRow(user.id),
    supabase.from("habits").select("*").eq("user_id", user.id).order("sort_order"),
    supabase.from("email_preferences").select("*").eq("user_id", user.id).single(),
  ]);

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-8">
      <div className="max-w-lg lg:max-w-5xl mx-auto p-4 lg:p-8 space-y-4 lg:space-y-6">
        <div className="flex items-center gap-2 pt-2">
          <Settings className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold tracking-tight">Configuracion</h1>
        </div>

        {/* Desktop: columna usuario | columna ciclo+hábitos */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-6 space-y-4 lg:space-y-0">
          {/* Columna izquierda: perfil y preferencias */}
          <div className="space-y-4">
            <ProfileCard
              name={userRow?.name ?? user.user_metadata?.full_name ?? "—"}
              email={user.email ?? ""}
            />
            <TimezoneCard currentTz={userRow?.timezone ?? DEFAULT_TIMEZONE} />
            <NotificationCard />
            <EmailCard
              initialPrefs={emailPrefs ?? null}
              userEmail={user.email ?? ""}
            />
            <form action={signOutAction}>
              <Button
                variant="ghost"
                className="w-full h-11 text-muted-foreground hover:text-destructive"
                type="submit"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar sesion
              </Button>
            </form>
          </div>

          {/* Columna derecha: ciclo y hábitos */}
          <div className="space-y-4">
            <CycleForm activeCycle={activeCycle} />
            {activeCycle && <PauseCycleCard cycle={activeCycle} />}
            {activeCycle && <RestartCycleCard />}
            <HabitManager habits={allHabits ?? []} />
          </div>
        </div>
      </div>
    </div>
  );
}
