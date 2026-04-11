"use client";

import { useState } from "react";
import { HabitChecklist } from "./habit-checklist";
import { GymToggle } from "./gym-toggle";
import { MealTracker } from "./meal-tracker";
import { ReadingTracker } from "./reading-tracker";
import { CalendarDays } from "lucide-react";
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
}: CheckPageClientProps) {
  // Estado central: arrays completos para derivar progreso sin callbacks
  const [habitChecks, setHabitChecks] = useState(initialHabitChecks);
  const [meals, setMeals] = useState(initialMeals);
  const [hasReading, setHasReading] = useState(initialReadingMinutes > 0);
  const [hasTraining, setHasTraining] = useState(initialHasTraining);

  const supabase = createClient();

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
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto p-4 space-y-4">
        {/* Header */}
        <div className="pt-2 pb-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Hola, {userName}
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

        <HabitChecklist checks={habitChecks} onToggle={toggleHabit} />
        <GymToggle
          entryId={entryId}
          isGymDay={isGymDay}
          isRecoveryDay={isRecoveryDay}
          onTrainingChange={setHasTraining}
        />
        <MealTracker meals={meals} onToggle={toggleMeal} />
        <ReadingTracker
          entryId={entryId}
          initialMinutes={initialReadingMinutes}
          onReadingChange={setHasReading}
        />
      </div>
    </div>
  );
}
