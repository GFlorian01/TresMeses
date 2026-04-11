"use client";

import { useState } from "react";
import { StepGoals } from "./step-goals";
import { StepHabits } from "./step-habits";
import { StepConfirm } from "./step-confirm";
import { cn } from "@/lib/utils";

interface HabitItem {
  id: string;
  name: string;
  icon: string | null;
}

interface CustomHabit {
  name: string;
  icon: string;
}

interface OnboardingWizardProps {
  defaultHabits: HabitItem[];
  userName: string;
  todayStr: string;
}

export function OnboardingWizard({
  defaultHabits,
  userName,
  todayStr,
}: OnboardingWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [goals, setGoals] = useState<string[]>([]);
  const [activeHabitIds, setActiveHabitIds] = useState<Set<string>>(
    () => new Set(defaultHabits.map((h) => h.id))
  );
  const [customHabits, setCustomHabits] = useState<CustomHabit[]>([]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-lg mx-auto w-full flex-1 flex flex-col p-4 pt-8">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm text-muted-foreground">
            {userName ? `Hola, ${userName}` : "Bienvenido"}
          </p>
          <h1 className="text-2xl font-bold tracking-tight mt-1">
            Tu reto de 12 semanas
          </h1>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  s === step
                    ? "w-8 bg-primary"
                    : s < step
                      ? "w-4 bg-primary/50"
                      : "w-4 bg-muted"
                )}
              />
            </div>
          ))}
          <span className="text-xs text-muted-foreground ml-1">
            {step} de 3
          </span>
        </div>

        {/* Step content */}
        <div className="flex-1">
          {step === 1 && (
            <StepGoals
              goals={goals}
              onGoalsChange={setGoals}
              onNext={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <StepHabits
              defaultHabits={defaultHabits}
              activeHabitIds={activeHabitIds}
              customHabits={customHabits}
              onActiveHabitIdsChange={setActiveHabitIds}
              onCustomHabitsChange={setCustomHabits}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <StepConfirm
              goals={goals}
              defaultHabits={defaultHabits}
              activeHabitIds={activeHabitIds}
              customHabits={customHabits}
              todayStr={todayStr}
              onBack={() => setStep(2)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
