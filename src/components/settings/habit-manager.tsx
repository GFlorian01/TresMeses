"use client";

import { useTransition, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  addHabitAction,
  toggleHabitActive,
} from "@/app/(app)/settings/actions";
import { ListChecks, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Habit } from "@/types/database";

export function HabitManager({ habits }: { habits: Habit[] }) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <Card className="card-hover">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-primary" />
          Habitos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Lista */}
        <div className="space-y-1">
          {habits.map((habit) => (
            <button
              key={habit.id}
              disabled={isPending}
              onClick={() => {
                startTransition(() => {
                  toggleHabitActive(habit.id, !habit.is_active);
                });
              }}
              className={cn(
                "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all",
                habit.is_active
                  ? "bg-accent/30 hover:bg-accent/50"
                  : "opacity-40 hover:opacity-60"
              )}
            >
              {habit.icon && <span className="text-base">{habit.icon}</span>}
              <span className="text-sm flex-1">{habit.name}</span>
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  habit.is_active ? "bg-green-500" : "bg-muted-foreground"
                )}
              />
            </button>
          ))}
        </div>

        {/* Agregar */}
        <form
          ref={formRef}
          action={(formData) => {
            startTransition(async () => {
              await addHabitAction(formData);
              formRef.current?.reset();
            });
          }}
          className="flex gap-2 pt-1"
        >
          <Input
            name="icon"
            placeholder="🎯"
            className="w-14 text-center bg-accent/30 border-0 focus-visible:ring-1"
            maxLength={2}
          />
          <Input
            name="name"
            placeholder="Nuevo habito..."
            className="flex-1 bg-accent/30 border-0 focus-visible:ring-1"
            required
          />
          <Button
            type="submit"
            size="icon"
            disabled={isPending}
            className="rounded-xl shrink-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
