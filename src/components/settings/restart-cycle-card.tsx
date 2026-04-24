"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RotateCcw, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { restartCycleAction } from "@/app/(app)/settings/actions";
import { useRouter } from "next/navigation";

const RESTART_REASONS = [
  "No me fue bien, quiero empezar de nuevo",
  "Cambié mis metas",
  "Pasé mucho tiempo sin registrar",
  "Otro",
];

export function RestartCycleCard() {
  const router = useRouter();
  const [step, setStep] = useState<"idle" | "reason" | "confirm">("idle");
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [isPending, startTransition] = useTransition();

  function reset() {
    setStep("idle");
    setSelectedReason("");
    setCustomReason("");
  }

  const finalReason = selectedReason === "Otro" ? customReason.trim() : selectedReason;
  const canContinue = !!selectedReason && (selectedReason !== "Otro" || !!customReason.trim());

  if (step === "idle") {
    return (
      <Card className="card-hover">
        <CardContent className="pt-4">
          <Button
            variant="outline"
            className="w-full h-11 rounded-xl text-destructive hover:text-destructive border-destructive/30 hover:border-destructive/60"
            onClick={() => setStep("reason")}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reiniciar ciclo
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === "reason") {
    return (
      <Card className="card-hover border-destructive/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <RotateCcw className="h-4 w-4 text-destructive" />
            Reiniciar ciclo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            El ciclo actual se guardará en el historial y podrás empezar uno nuevo.
          </p>
          <div className="space-y-2">
            <Label className="text-sm">Motivo</Label>
            <div className="flex flex-col gap-2">
              {RESTART_REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedReason(r)}
                  className={cn(
                    "px-3 py-2 rounded-xl text-sm text-left font-medium border transition-colors",
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
              disabled={!canContinue}
              onClick={() => setStep("confirm")}
            >
              Continuar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-hover border-destructive/40">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          ¿Confirmar reinicio?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-muted-foreground">
          Motivo: <span className="text-foreground font-medium">{finalReason}</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Esta acción no se puede deshacer. El ciclo actual quedará en tu historial.
        </p>
        <div className="flex gap-2">
          <Button variant="ghost" className="flex-1 rounded-xl" onClick={reset}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            className="flex-1 rounded-xl"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await restartCycleAction(finalReason);
                reset();
                router.refresh();
              })
            }
          >
            {isPending ? "Reiniciando..." : "Sí, reiniciar"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
