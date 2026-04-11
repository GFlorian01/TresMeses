"use client";

import { useState, useRef } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
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

export function MealTracker({
  meals,
  onToggle,
}: {
  meals: MealItem[];
  onToggle: (id: string, completed: boolean) => void;
}) {
  // Solo el estado de descripciones es local — los toggles suben al padre
  const [descriptions, setDescriptions] = useState<Record<string, string>>(
    () => {
      const map: Record<string, string> = {};
      meals.forEach((m) => {
        map[m.id] = m.description ?? "";
      });
      return map;
    }
  );
  const supabase = createClient();
  const debounceRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const completedCount = meals.filter((m) => m.completed).length;

  const updateDescription = (id: string, value: string) => {
    setDescriptions((prev) => ({ ...prev, [id]: value }));
    if (debounceRef.current[id]) clearTimeout(debounceRef.current[id]);
    debounceRef.current[id] = setTimeout(() => {
      supabase
        .from("meal_entries")
        .update({ description: value })
        .eq("id", id)
        .then();
    }, 800);
  };

  return (
    <Card className="card-hover">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <UtensilsCrossed className="h-4 w-4 text-primary" />
            Comidas
          </span>
          <span className="text-xs font-normal text-muted-foreground tabular-nums">
            {completedCount}/{meals.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {meals.map((meal) => {
          const info = mealLabels[meal.meal_type];
          return (
            <div key={meal.id}>
              <label className="flex items-center gap-3 cursor-pointer rounded-lg px-2 py-2.5 transition-colors hover:bg-accent/50 active:bg-accent/70">
                <Checkbox
                  checked={meal.completed}
                  onCheckedChange={(checked) =>
                    onToggle(meal.id, checked === true)
                  }
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <span className="text-sm flex items-center gap-2 select-none">
                  <span className="text-base">{info.icon}</span>
                  <span
                    className={
                      meal.completed ? "line-through text-muted-foreground" : ""
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
                    onChange={(e) => updateDescription(meal.id, e.target.value)}
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
