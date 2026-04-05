"use client";

import { useTransition, useState, useOptimistic } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateMeal } from "@/app/(app)/check/actions";
import { UtensilsCrossed } from "lucide-react";
import type { MealType } from "@/types/database";

interface MealItem {
  id: string;
  meal_type: MealType;
  completed: boolean;
  description: string | null;
}

const mealLabels: Record<MealType, { label: string; icon: string }> = {
  BREAKFAST: { label: "Desayuno", icon: "🌅" },
  LUNCH: { label: "Almuerzo", icon: "☀️" },
  DINNER: { label: "Cena", icon: "🌙" },
  SNACK: { label: "Snack", icon: "🍎" },
};

export function MealTracker({ meals }: { meals: MealItem[] }) {
  const [isPending, startTransition] = useTransition();
  const [optimisticMeals, setOptimistic] = useOptimistic(
    meals,
    (state, { id, completed }: { id: string; completed: boolean }) =>
      state.map((m) => (m.id === id ? { ...m, completed } : m))
  );
  const [descriptions, setDescriptions] = useState<Record<string, string>>(
    () => {
      const map: Record<string, string> = {};
      meals.forEach((m) => {
        map[m.id] = m.description ?? "";
      });
      return map;
    }
  );

  const completedCount = optimisticMeals.filter((m) => m.completed).length;

  return (
    <Card className="card-hover">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <UtensilsCrossed className="h-4 w-4 text-primary" />
            Comidas
          </span>
          <span className="text-xs font-normal text-muted-foreground tabular-nums">
            {completedCount}/{optimisticMeals.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {optimisticMeals.map((meal) => {
          const info = mealLabels[meal.meal_type];
          return (
            <div key={meal.id}>
              <label className="flex items-center gap-3 cursor-pointer rounded-lg px-2 py-2.5 transition-colors hover:bg-accent/50">
                <Checkbox
                  checked={meal.completed}
                  disabled={isPending}
                  onCheckedChange={(checked) => {
                    const val = checked === true;
                    startTransition(() => {
                      setOptimistic({ id: meal.id, completed: val });
                      updateMeal(meal.id, val, descriptions[meal.id]);
                    });
                  }}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <span className="text-sm flex items-center gap-2">
                  <span className="text-base">{info.icon}</span>
                  <span
                    className={
                      meal.completed
                        ? "line-through text-muted-foreground"
                        : ""
                    }
                  >
                    {info.label}
                  </span>
                </span>
              </label>
              {meal.completed && (
                <div className="ml-11 mr-2 mb-1">
                  <Input
                    placeholder="¿Que comiste? (opcional)"
                    value={descriptions[meal.id] ?? ""}
                    className="text-xs h-8 bg-accent/30 border-0 focus-visible:ring-1"
                    onChange={(e) => {
                      setDescriptions((prev) => ({
                        ...prev,
                        [meal.id]: e.target.value,
                      }));
                    }}
                    onBlur={() => {
                      startTransition(() => {
                        updateMeal(meal.id, true, descriptions[meal.id]);
                      });
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
