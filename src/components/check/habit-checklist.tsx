"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { createClient } from "@/lib/supabase/client";
import { ListChecks } from "lucide-react";

interface HabitCheckItem {
  id: string;
  completed: boolean;
  habit: {
    id: string;
    name: string;
    icon: string | null;
  };
}

export function HabitChecklist({
  checks: initialChecks,
}: {
  checks: HabitCheckItem[];
}) {
  const [checks, setChecks] = useState(initialChecks);
  const supabase = createClient();

  const completedCount = checks.filter((c) => c.completed).length;
  const total = checks.length;
  const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  const toggle = (id: string, completed: boolean) => {
    setChecks((prev) =>
      prev.map((c) => (c.id === id ? { ...c, completed } : c))
    );
    supabase.from("habit_checks").update({ completed }).eq("id", id).then();
  };

  return (
    <Card className="card-hover">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-primary" />
            Rutina diaria
          </span>
          <span className="text-xs font-normal text-muted-foreground tabular-nums">
            {completedCount}/{total}
          </span>
        </CardTitle>
        <Progress value={percent} className="h-1.5 mt-2" />
      </CardHeader>
      <CardContent className="space-y-1">
        {checks.map((check) => (
          <label
            key={check.id}
            className="flex items-center gap-3 cursor-pointer rounded-lg px-2 py-2.5 transition-colors hover:bg-accent/50 active:bg-accent/70"
          >
            <Checkbox
              checked={check.completed}
              onCheckedChange={(checked) =>
                toggle(check.id, checked === true)
              }
              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <span className="text-sm flex items-center gap-2 select-none">
              {check.habit.icon && (
                <span className="text-base">{check.habit.icon}</span>
              )}
              <span
                className={
                  check.completed
                    ? "line-through text-muted-foreground"
                    : ""
                }
              >
                {check.habit.name}
              </span>
            </span>
          </label>
        ))}
      </CardContent>
    </Card>
  );
}
