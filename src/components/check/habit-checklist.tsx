"use client";

import { useTransition, useOptimistic } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toggleHabit } from "@/app/(app)/check/actions";
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

export function HabitChecklist({ checks }: { checks: HabitCheckItem[] }) {
  const [isPending, startTransition] = useTransition();
  const [optimisticChecks, setOptimistic] = useOptimistic(
    checks,
    (state, { id, completed }: { id: string; completed: boolean }) =>
      state.map((c) => (c.id === id ? { ...c, completed } : c))
  );

  const completedCount = optimisticChecks.filter((c) => c.completed).length;
  const total = optimisticChecks.length;
  const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

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
        {optimisticChecks.map((check) => (
          <label
            key={check.id}
            className="flex items-center gap-3 cursor-pointer rounded-lg px-2 py-2.5 transition-colors hover:bg-accent/50"
          >
            <Checkbox
              checked={check.completed}
              disabled={isPending}
              onCheckedChange={(checked) => {
                const val = checked === true;
                startTransition(() => {
                  setOptimistic({ id: check.id, completed: val });
                  toggleHabit(check.id, val);
                });
              }}
              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <span className="text-sm flex items-center gap-2">
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
