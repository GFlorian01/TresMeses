"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { completeOnboardingAction } from "@/app/onboarding/actions";
import { format, addDays } from "date-fns";
import { es } from "date-fns/locale";
import { parseDateSafe } from "@/lib/date-utils";
import { CalendarDays, Target, ListChecks, Loader2 } from "lucide-react";

interface HabitItem {
  id: string;
  name: string;
  icon: string | null;
}

interface CustomHabit {
  name: string;
  icon: string;
}

interface StepConfirmProps {
  goals: string[];
  defaultHabits: HabitItem[];
  activeHabitIds: Set<string>;
  customHabits: CustomHabit[];
  todayStr: string;
  onBack: () => void;
}

export function StepConfirm({
  goals,
  defaultHabits,
  activeHabitIds,
  customHabits,
  todayStr,
  onBack,
}: StepConfirmProps) {
  const [loading, setLoading] = useState(false);

  const startDate = parseDateSafe(todayStr);
  const endDate = addDays(startDate, 83);

  const activeDefaultHabits = defaultHabits.filter((h) => activeHabitIds.has(h.id));
  const allActiveHabits = [
    ...activeDefaultHabits,
    ...customHabits.map((h) => ({ id: "", name: h.name, icon: h.icon || null })),
  ];

  const handleStart = async () => {
    setLoading(true);
    await completeOnboardingAction({
      goals,
      activeHabitIds: Array.from(activeHabitIds),
      customHabits,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">¡Todo listo!</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Confirma tu reto de 12 semanas antes de empezar.
        </p>
      </div>

      {/* Period */}
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-accent/30 border border-border/40">
        <CalendarDays className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium">12 semanas</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {format(startDate, "d 'de' MMMM", { locale: es })} →{" "}
            {format(endDate, "d 'de' MMMM, yyyy", { locale: es })}
          </p>
        </div>
      </div>

      {/* Goals summary */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Target className="h-4 w-4 text-primary" />
          Metas
        </div>
        {goals.length === 0 ? (
          <p className="text-sm text-muted-foreground pl-6">Sin metas definidas</p>
        ) : (
          <ul className="space-y-1 pl-6">
            {goals.map((g) => (
              <li key={g} className="text-sm text-muted-foreground flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-primary/60 shrink-0" />
                {g}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Habits summary */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <ListChecks className="h-4 w-4 text-primary" />
          Rutina diaria ({allActiveHabits.length} hábitos)
        </div>
        {allActiveHabits.length === 0 ? (
          <p className="text-sm text-muted-foreground pl-6">Sin hábitos seleccionados</p>
        ) : (
          <ul className="space-y-1 pl-6">
            {allActiveHabits.map((h, i) => (
              <li key={h.id || i} className="text-sm text-muted-foreground flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-primary/60 shrink-0" />
                {h.icon && <span>{h.icon}</span>}
                {h.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={onBack}
          disabled={loading}
          className="flex-1"
        >
          Atrás
        </Button>
        <Button
          type="button"
          size="lg"
          onClick={handleStart}
          disabled={loading}
          className="flex-[2]"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Iniciando...
            </>
          ) : (
            "Comenzar el reto"
          )}
        </Button>
      </div>
    </div>
  );
}
