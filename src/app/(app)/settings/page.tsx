import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getActiveCycle } from "@/lib/queries";
import { CycleForm } from "@/components/settings/cycle-form";
import { HabitManager } from "@/components/settings/habit-manager";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { signOutAction } from "./actions";
import { Settings, User, LogOut } from "lucide-react";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const activeCycle = await getActiveCycle(user.id);

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

        {/* Perfil */}
        <Card className="card-hover">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Perfil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center rounded-lg bg-accent/30 px-3 py-2.5">
              <span className="text-xs text-muted-foreground">Nombre</span>
              <span className="text-sm font-medium">
                {user.user_metadata?.full_name ?? "—"}
              </span>
            </div>
            <div className="flex justify-between items-center rounded-lg bg-accent/30 px-3 py-2.5">
              <span className="text-xs text-muted-foreground">Email</span>
              <span className="text-sm font-medium">{user.email}</span>
            </div>
          </CardContent>
        </Card>

        <CycleForm activeCycle={activeCycle} />
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
