import { createClient } from "@/lib/supabase/server";
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
import { DEFAULT_TIMEZONE } from "@/lib/date-utils";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const activeCycle = await getActiveCycle(user.id);

  const { data: userRow } = await supabase
    .from("users")
    .select("timezone")
    .eq("id", user.id)
    .single();

  const { data: allHabits } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", user.id)
    .order("sort_order");

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto p-4 space-y-4">
        <div className="flex items-center gap-2 pt-2">
          <Settings className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold tracking-tight">Configuracion</h1>
        </div>

        <ProfileCard
          name={user.user_metadata?.full_name ?? "—"}
          email={user.email ?? ""}
        />

        <TimezoneCard currentTz={userRow?.timezone ?? DEFAULT_TIMEZONE} />
        <NotificationCard />
        <CycleForm activeCycle={activeCycle} />
        {activeCycle && <PauseCycleCard cycle={activeCycle} />}
        {activeCycle && <RestartCycleCard />}
        <HabitManager habits={allHabits ?? []} />

        {/* Cerrar sesión */}
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
    </div>
  );
}
