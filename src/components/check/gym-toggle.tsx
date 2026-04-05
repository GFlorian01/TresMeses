"use client";

import { useTransition, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell } from "lucide-react";
import { toggleGymDay } from "@/app/(app)/check/actions";
import { cn } from "@/lib/utils";

type TrainingType = "none" | "gym" | "recovery";

const options: { type: TrainingType; label: string; emoji: string }[] = [
  { type: "none", label: "Descanso", emoji: "😴" },
  { type: "gym", label: "Gym", emoji: "🏋️" },
  { type: "recovery", label: "Recuperacion", emoji: "🧘" },
];

export function GymToggle({
  entryId,
  isGymDay,
  isRecoveryDay,
}: {
  entryId: string;
  isGymDay: boolean;
  isRecoveryDay: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const initial: TrainingType = isGymDay
    ? "gym"
    : isRecoveryDay
      ? "recovery"
      : "none";
  const [selected, setSelected] = useState<TrainingType>(initial);

  const handleSelect = (type: TrainingType) => {
    setSelected(type);
    startTransition(() => {
      toggleGymDay(entryId, type === "gym", type === "recovery");
    });
  };

  return (
    <Card className="card-hover">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Dumbbell className="h-4 w-4 text-primary" />
          Entrenamiento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          {options.map((opt) => (
            <button
              key={opt.type}
              disabled={isPending}
              onClick={() => handleSelect(opt.type)}
              className={cn(
                "flex flex-col items-center gap-1 py-3 px-2 rounded-xl text-xs font-medium transition-all duration-200 border",
                selected === opt.type
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-transparent border-border/50 text-muted-foreground hover:bg-accent/50"
              )}
            >
              <span className="text-xl">{opt.emoji}</span>
              {opt.label}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
