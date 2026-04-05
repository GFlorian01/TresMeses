"use client";

import { useTransition, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { saveWeeklyReview } from "@/app/(app)/review/actions";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertTriangle } from "lucide-react";

interface ReviewFormProps {
  userId: string;
  cycleId: string;
  weekNumber: number;
  weekScore: number;
  existingReview: {
    reflection: string | null;
    cause_analysis: string | null;
    load_adjustment: string | null;
  } | null;
}

export function ReviewForm({
  userId,
  cycleId,
  weekNumber,
  weekScore,
  existingReview,
}: ReviewFormProps) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [reflection, setReflection] = useState(
    existingReview?.reflection ?? ""
  );
  const [causeAnalysis, setCauseAnalysis] = useState(
    existingReview?.cause_analysis ?? ""
  );
  const [loadAdjustment, setLoadAdjustment] = useState(
    existingReview?.load_adjustment ?? ""
  );

  const needsAnalysis = weekScore < 85;
  const isGood = weekScore >= 85;

  const handleSave = () => {
    setSaved(false);
    startTransition(async () => {
      await saveWeeklyReview(userId, cycleId, weekNumber, {
        score: weekScore,
        reflection,
        causeAnalysis,
        loadAdjustment,
      });
      setSaved(true);
    });
  };

  return (
    <div className="space-y-4">
      {/* Score banner */}
      <Card
        className={cn(
          "overflow-hidden relative",
          isGood ? "border-green-500/20" : "border-red-500/20"
        )}
      >
        <div
          className={cn(
            "absolute top-0 left-0 right-0 h-1",
            isGood
              ? "bg-gradient-to-r from-green-500 to-emerald-400"
              : "bg-gradient-to-r from-red-500 to-rose-400"
          )}
        />
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-2.5 rounded-xl",
                isGood ? "bg-green-500/10" : "bg-red-500/10"
              )}
            >
              {isGood ? (
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-red-500" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium">Semana {weekNumber}</p>
              <div className="flex items-baseline gap-1.5">
                <span
                  className={cn(
                    "text-2xl font-bold",
                    isGood ? "text-green-500" : "text-red-500"
                  )}
                >
                  {weekScore}%
                </span>
                <span className="text-xs text-muted-foreground">
                  de ejecucion
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulario */}
      <Card className="card-hover">
        <CardContent className="pt-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="reflection" className="text-sm font-medium">
              ¿Como fue tu semana?
            </Label>
            <Textarea
              id="reflection"
              placeholder="Que lograste, que te costo, como te sentiste..."
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              rows={3}
              className="bg-accent/30 border-0 focus-visible:ring-1 resize-none"
            />
          </div>

          {needsAnalysis && (
            <>
              <div className="space-y-2">
                <Label
                  htmlFor="cause"
                  className="text-sm font-medium text-red-400"
                >
                  ¿Por que no llegaste al 85%?
                </Label>
                <Textarea
                  id="cause"
                  placeholder="Que obstaculos encontraste, que te impidio cumplir..."
                  value={causeAnalysis}
                  onChange={(e) => setCauseAnalysis(e.target.value)}
                  rows={3}
                  className="bg-red-500/5 border-red-500/20 focus-visible:ring-red-500/30 resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adjustment" className="text-sm font-medium">
                  ¿Que ajustas para la siguiente semana?
                </Label>
                <Textarea
                  id="adjustment"
                  placeholder="Reducir carga, cambiar horarios, eliminar algo..."
                  value={loadAdjustment}
                  onChange={(e) => setLoadAdjustment(e.target.value)}
                  rows={3}
                  className="bg-accent/30 border-0 focus-visible:ring-1 resize-none"
                />
              </div>
            </>
          )}

          <Button
            onClick={handleSave}
            disabled={isPending}
            className="w-full h-11 rounded-xl font-medium"
          >
            {isPending
              ? "Guardando..."
              : saved
                ? "Guardado"
                : "Guardar revision"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
