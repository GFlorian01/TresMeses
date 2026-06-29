"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HabitChecklist } from "./habit-checklist";
import { GymToggle } from "./gym-toggle";
import { MealTracker } from "./meal-tracker";
import { ReadingTracker } from "./reading-tracker";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { MealType } from "@/types/database";

interface HabitCheckItem {
  id: string;
  completed: boolean;
  habit: {
    id: string;
    name: string;
    icon: string | null;
  };
}

interface MealItem {
  id: string;
  meal_type: MealType;
  completed: boolean;
  description: string | null;
}

interface CheckPageClientProps {
  userName: string;
  formattedDate: string;
  habitChecks: HabitCheckItem[];
  entryId: string;
  isGymDay: boolean;
  isRecoveryDay: boolean;
  meals: MealItem[];
  initialReadingMinutes: number;
  initialHasTraining: boolean;
  dateStr: string;
  todayStr: string;
  cycleStart: string;
}

function offsetDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export function CheckPageClient({
  userName,
  formattedDate,
  habitChecks: initialHabitChecks,
  entryId,
  isGymDay,
  isRecoveryDay,
  meals: initialMeals,
  initialReadingMinutes,
  initialHasTraining,
  dateStr,
  todayStr,
  cycleStart,
}: CheckPageClientProps) {
  // Estado central: arrays completos para derivar progreso sin callbacks
  const [habitChecks, setHabitChecks] = useState(initialHabitChecks);
  const [meals, setMeals] = useState(initialMeals);
  const [hasReading, setHasReading] = useState(initialReadingMinutes > 0);
  const [hasTraining, setHasTraining] = useState(initialHasTraining);

  const router = useRouter();
  const supabase = createClient();

  const isToday = dateStr === todayStr;
  const isFirstDay = dateStr <= cycleStart;

  const goToDate = (newDate: string) => {
    if (newDate === todayStr) {
      router.push("/check");
    } else {
      router.push(`/check?date=${newDate}`);
    }
  };

  // Progreso derivado directamente del estado — siempre sincronizado
  const habitsDone = habitChecks.filter((c) => c.completed).length;
  const mealsDone = meals.filter((m) => m.completed).length;
  const totalItems = habitChecks.length + meals.length + 2;
  const completedItems =
    habitsDone + mealsDone + (hasReading ? 1 : 0) + (hasTraining ? 1 : 0);
  const progressPercent =
    totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const toggleHabit = (id: string, completed: boolean) => {
    setHabitChecks((prev) =>
      prev.map((c) => (c.id === id ? { ...c, completed } : c))
    );
    supabase.from("habit_checks").update({ completed }).eq("id", id).then();
  };

  const toggleMeal = (id: string, completed: boolean) => {
    setMeals((prev) =>
      prev.map((m) => (m.id === id ? { ...m, completed } : m))
    );
    supabase.from("meal_entries").update({ completed }).eq("id", id).then();
  };

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-8">
      <div className="max-w-lg lg:max-w-4xl mx-auto p-4 lg:p-8 space-y-4 lg:space-y-6">
        {/* Header */}
        <div className="pt-2 pb-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Hola, {userName}
              </h1>
              <div className="flex items-center gap-1 mt-0.5">
                <button
                  onClick={() => goToDate(offsetDate(dateStr, -1))}
                  disabled={isFirstDay}
                  className="p-0.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Día anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground capitalize">
                    {formattedDate}
                  </p>
                </div>
                <button
                  onClick={() => goToDate(offsetDate(dateStr, 1))}
                  disabled={isToday}
                  className="p-0.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Día siguiente"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
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

        {/* Desktop: 2 columnas | Mobile: stack */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-6 space-y-4 lg:space-y-0">
          <div className="space-y-4">
            <HabitChecklist checks={habitChecks} onToggle={toggleHabit} />
            <GymToggle
              entryId={entryId}
              isGymDay={isGymDay}
              isRecoveryDay={isRecoveryDay}
              onTrainingChange={setHasTraining}
            />
          </div>
          <div className="space-y-4">
            <MealTracker meals={meals} onToggle={toggleMeal} />
            <ReadingTracker
              entryId={entryId}
              initialMinutes={initialReadingMinutes}
              onReadingChange={setHasReading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
