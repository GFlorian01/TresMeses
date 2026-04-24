"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PauseCircle, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { pauseCycleAction, resumeCycleAction } from "@/app/(app)/settings/actions";
import { useRouter } from "next/navigation";
import type { Cycle } from "@/types/database";

const PAUSE_REASONS = ["Viaje", "Enfermedad", "Trabajo intenso", "Familia", "Otro"];

export function PauseCycleCard({ cycle }: { cycle: Cycle }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [isPending, startTransition] = useTransition();

  function reset() {
    setShowForm(false);
    setSelectedReason("");
    setCustomReason("");
  }

  if (cycle.is_paused) {
    return (
      <Card className="card-hover border-amber-500/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <PauseCircle className="h-4 w-4 text-amber-500" />
            Ciclo pausado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {cycle.pause_reason && (
            <p className="text-sm text-muted-foreground">
              Motivo: <span className="text-foreground">{cycle.pause_reason}</span>
            </p>
          )}
          <Button
            className="w-full h-11 rounded-xl"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await resumeCycleAction();
                router.refresh();
              })
            }
          >
            <Play className="h-4 w-4 mr-2" />
            {isPending ? "Retomando..." : "Retomar ciclo"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!showForm) {
    return (
      <Card className="card-hover">
        <CardContent className="pt-4">
          <Button
            variant="outline"
            className="w-full h-11 rounded-xl"
            onClick={() => setShowForm(true)}
          >
            <PauseCircle className="h-4 w-4 mr-2" />
            Pausar ciclo
          </Button>
        </CardContent>
      </Card>
    );
  }

  const finalReason = selectedReason === "Otro" ? customReason.trim() : selectedReason;
  const canSubmit = !!selectedReason && (selectedReason !== "Otro" || !!customReason.trim());

  return (
    <Card className="card-hover">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <PauseCircle className="h-4 w-4 text-amber-500" />
          Pausar ciclo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          El ciclo se congela y la fecha de fin se extiende cuando lo retomes.
        </p>
        <div className="space-y-2">
          <Label className="text-sm">Motivo</Label>
          <div className="flex flex-wrap gap-2">
            {PAUSE_REASONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setSelectedReason(r)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                  selectedReason === r
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border hover:border-primary"
                )}
              >
                {r}
              </button>
            ))}
          </div>
          {selectedReason === "Otro" && (
            <Textarea
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Describe el motivo..."
              rows={2}
              className="bg-accent/30 border-0 focus-visible:ring-1 resize-none text-sm mt-2"
            />
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" className="flex-1 rounded-xl" onClick={reset}>
            Cancelar
          </Button>
          <Button
            className="flex-1 rounded-xl"
            disabled={!canSubmit || isPending}
            onClick={() =>
              startTransition(async () => {
                await pauseCycleAction(finalReason);
                reset();
                router.refresh();
              })
            }
          >
            {isPending ? "Pausando..." : "Pausar"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
