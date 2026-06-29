"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { saveWeeklyReview } from "@/app/(app)/review/actions";
import { restartCycleAction as restartCycle } from "@/app/(app)/settings/actions";
import { cn, getScoreTier } from "@/lib/utils";
import {
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  TrendingUp,
  Heart,
} from "lucide-react";

const DAY_NAMES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function scoreColor(score: number) { return getScoreTier(score).text; }
function scoreBg(score: number) { return getScoreTier(score).bg; }

interface ReviewFormProps {
  userId: string;
  cycleId: string;
  viewWeek: number;
  currentWeek: number;
  weekScore: number;
  weekScores: Array<{ week: number; score: number; hasData: boolean }>;
  dailyGrid: Array<{ date: string; score: number | null }>;
  existingReview: {
    reflection: string | null;
    cause_analysis: string | null;
    load_adjustment: string | null;
  } | null;
  isSunday: boolean;
}

export function ReviewForm({
  userId,
  cycleId,
  viewWeek,
  currentWeek,
  weekScore,
  weekScores,
  dailyGrid,
  existingReview,
  isSunday,
}: ReviewFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isRestarting, startRestartTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  const [reflection, setReflection] = useState(existingReview?.reflection ?? "");
  const [causeAnalysis, setCauseAnalysis] = useState(existingReview?.cause_analysis ?? "");
  const [loadAdjustment, setLoadAdjustment] = useState(existingReview?.load_adjustment ?? "");

  const needsAnalysis = weekScore < 85;
  const isGood = weekScore >= 85;

  // Compliance analysis
  const completedWeeks1to4 = weekScores.filter(w => w.week <= 4 && w.hasData);
  const avg1to4 =
    completedWeeks1to4.length > 0
      ? Math.round(completedWeeks1to4.reduce((s, w) => s + w.score, 0) / completedWeeks1to4.length)
      : null;

  const completedWeeks5to8 = weekScores.filter(w => w.week >= 5 && w.week <= 8 && w.hasData);
  const avg5to8 =
    completedWeeks5to8.length > 0
      ? Math.round(completedWeeks5to8.reduce((s, w) => s + w.score, 0) / completedWeeks5to8.length)
      : null;

  const showPromise = currentWeek >= 5 && avg1to4 !== null && avg1to4 < 75;
  const showMotivational = currentWeek >= 9 && avg5to8 !== null && avg5to8 < 75;
  const showRestart = showPromise || showMotivational || isSunday;

  const handleSave = () => {
    setSaved(false);
    startTransition(async () => {
      await saveWeeklyReview(userId, cycleId, viewWeek, {
        score: weekScore,
        reflection,
        causeAnalysis,
        loadAdjustment,
      });
      setSaved(true);
    });
  };

  const handleRestart = () => {
    startRestartTransition(async () => {
      await restartCycle("Reinicio desde revisión semanal");
      router.push("/onboarding");
    });
  };

  return (
    <div className="space-y-4">
      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <a
          href={viewWeek > 1 ? `/review?week=${viewWeek - 1}` : undefined}
          className={cn(
            "flex items-center gap-1 text-sm font-medium transition-colors",
            viewWeek > 1
              ? "text-primary hover:text-primary/80"
              : "text-muted-foreground pointer-events-none opacity-30"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
          Semana {viewWeek - 1}
        </a>
        <span className="text-sm font-semibold text-foreground">
          Semana {viewWeek} / {currentWeek}
        </span>
        <a
          href={viewWeek < currentWeek ? `/review?week=${viewWeek + 1}` : undefined}
          className={cn(
            "flex items-center gap-1 text-sm font-medium transition-colors",
            viewWeek < currentWeek
              ? "text-primary hover:text-primary/80"
              : "text-muted-foreground pointer-events-none opacity-30"
          )}
        >
          Semana {viewWeek + 1}
          <ChevronRight className="h-4 w-4" />
        </a>
      </div>

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
        <CardContent className="pt-5 pb-4 space-y-4">
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
              <p className="text-sm font-medium">Semana {viewWeek}</p>
              <div className="flex items-baseline gap-1.5">
                <span
                  className={cn(
                    "text-2xl font-bold",
                    isGood ? "text-green-500" : "text-red-500"
                  )}
                >
                  {weekScore}%
                </span>
                <span className="text-xs text-muted-foreground">de ejecucion</span>
              </div>
            </div>
          </div>

          {/* Daily grid */}
          <div className="grid grid-cols-7 gap-1">
            {dailyGrid.map((day, i) => (
              <div key={day.date} className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-muted-foreground">{DAY_NAMES[i]}</span>
                {day.score !== null ? (
                  <div className="relative w-full flex flex-col items-center gap-0.5">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold text-white",
                        scoreBg(day.score)
                      )}
                    >
                      {day.score}
                    </div>
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-accent/40 flex items-center justify-center">
                    <span className="text-[10px] text-muted-foreground">—</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Compliance alerts */}
      {showMotivational && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="pt-4 pb-4 flex gap-3">
            <Heart className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-amber-500">
                Esto es por tu bien
              </p>
              <p className="text-xs text-muted-foreground">
                Llevas dos bloques de 4 semanas por debajo del 75%. A veces reiniciar
                con un compromiso renovado es la mejor decisión. No es rendirse —
                es elegir volver a empezar con más claridad.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {!showMotivational && showPromise && (
        <Card className="border-yellow-500/30 bg-yellow-500/5">
          <CardContent className="pt-4 pb-4 flex gap-3">
            <TrendingUp className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-yellow-500">
                Promesa de mejora
              </p>
              <p className="text-xs text-muted-foreground">
                El promedio de tus primeras 4 semanas fue {avg1to4}% — por debajo del
                75%. Las próximas 4 semanas son tu oportunidad de demostrar que puedes
                hacerlo. ¿Cuál es tu compromiso?
              </p>
            </div>
          </CardContent>
        </Card>
      )}

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
                <Label htmlFor="cause" className="text-sm font-medium text-red-400">
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
            {isPending ? "Guardando..." : saved ? "Guardado" : "Guardar revision"}
          </Button>
        </CardContent>
      </Card>

      {/* Restart cycle */}
      {showRestart && (
        <Card className="border-dashed border-muted-foreground/30">
          <CardContent className="pt-4 pb-4">
            {!showRestartConfirm ? (
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Volver a empezar</p>
                  <p className="text-xs text-muted-foreground">
                    Reinicia el ciclo desde el día 0
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 gap-1.5 border-muted-foreground/30"
                  onClick={() => setShowRestartConfirm(true)}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reiniciar
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm font-medium">
                  ¿Seguro que quieres reiniciar?
                </p>
                <p className="text-xs text-muted-foreground">
                  El ciclo actual se cerrará y podrás configurar uno nuevo desde cero.
                  Tu historial se conserva.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setShowRestartConfirm(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1"
                    disabled={isRestarting}
                    onClick={handleRestart}
                  >
                    {isRestarting ? "Cerrando..." : "Sí, reiniciar"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
