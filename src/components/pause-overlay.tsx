"use client";

import { useState, useEffect, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Play, PauseCircle, Dumbbell, BookOpen, TrendingUp, Calendar } from "lucide-react";
import { resumeCycleAction } from "@/app/(app)/settings/actions";

const MOTIVATIONAL_MESSAGES = [
  "Las pausas también son parte del camino. Cuando regreses, lo harás con más fuerza.",
  "Descansar no es rendirse. Es prepararse para el siguiente paso.",
  "Tu progreso no desaparece. Sigue ahí, esperando que lo retomes.",
  "Los grandes logros se construyen con constancia, y la constancia incluye saber cuándo parar.",
  "Una pausa bien tomada puede ser el mejor impulso para continuar.",
  "Tu cuerpo y tu mente necesitan recargar energía. Vuelve cuando estés listo.",
  "El éxito no es lineal. Cada pausa es parte de tu historia de crecimiento.",
  "No importa cuánto tiempo lleves en pausa. Importa que elijas continuar.",
  "Los mejores atletas también descansan. Tu ciclo te espera.",
  "Retomar es tan valioso como empezar. Tienes todo para lograrlo.",
  "La vida tiene sus ritmos. Respétalos y vuelve con más claridad.",
  "Tu compromiso con el cambio sigue vivo. Solo está esperando el momento correcto.",
  "Cada día que decides retomar es una victoria en sí misma.",
  "El camino no se borró. Solo lo pausaste. Sigue cuando sientas que es el momento.",
  "Las mejores historias tienen altibajos. La tuya también.",
];

export interface PauseData {
  pauseReason: string | null;
  pausedAt: string;
  elapsedDaysAtPause: number;
  progressAtPause: number;
  gymDays: number;
  recoveryDays: number;
  readingDays: number;
  totalReadingMinutes: number;
  avgScore: number;
  totalDaysTracked: number;
}

export function PauseOverlay({ data }: { data: PauseData }) {
  const pathname = usePathname();
  const router = useRouter();
  const [showModal, setShowModal] = useState(true);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setShowModal(true);
    setMessage(
      MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)]
    );
  }, [pathname]);

  if (pathname.startsWith("/settings")) return null;

  const pausedDate = new Date(data.pausedAt).toLocaleDateString("es", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Gray tint only, modal dismissed for this page visit
  if (!showModal) {
    return (
      <div
        className="fixed inset-0 z-40 bg-gray-950/25 pointer-events-none"
        style={{ bottom: "3.5rem" }}
      />
    );
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4"
      style={{ bottom: "3.5rem" }}
    >
      {/* Backdrop blur */}
      <div className="absolute inset-0 bg-gray-950/75 backdrop-blur-md" />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-sm space-y-4">
        {/* Badge */}
        <div className="flex justify-center">
          <div className="flex items-center gap-1.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full px-3 py-1 text-xs font-semibold">
            <PauseCircle className="h-3.5 w-3.5" />
            Ciclo en pausa
          </div>
        </div>

        {/* Motivational message card */}
        <div className="bg-card border border-border/60 rounded-2xl p-5 shadow-2xl space-y-4">
          <p className="text-sm font-medium leading-relaxed text-center text-foreground/90">
            "{message}"
          </p>

          <div className="border-t border-border/40 pt-3 space-y-2">
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider text-center">
              Tu progreso al pausar · {pausedDate}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-accent/30 rounded-xl px-3 py-2 flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                <div>
                  <p className="text-[10px] text-muted-foreground">Día</p>
                  <p className="text-sm font-semibold">{data.elapsedDaysAtPause} / 84</p>
                </div>
              </div>
              <div className="bg-accent/30 rounded-xl px-3 py-2 flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-primary shrink-0" />
                <div>
                  <p className="text-[10px] text-muted-foreground">Avance</p>
                  <p className="text-sm font-semibold">{data.progressAtPause}%</p>
                </div>
              </div>
              <div className="bg-accent/30 rounded-xl px-3 py-2 flex items-center gap-2">
                <Dumbbell className="h-3.5 w-3.5 text-primary shrink-0" />
                <div>
                  <p className="text-[10px] text-muted-foreground">Gym / Recuperación</p>
                  <p className="text-sm font-semibold">
                    {data.gymDays}g · {data.recoveryDays}r
                  </p>
                </div>
              </div>
              <div className="bg-accent/30 rounded-xl px-3 py-2 flex items-center gap-2">
                <BookOpen className="h-3.5 w-3.5 text-primary shrink-0" />
                <div>
                  <p className="text-[10px] text-muted-foreground">Lectura</p>
                  <p className="text-sm font-semibold">
                    {data.readingDays} días
                  </p>
                </div>
              </div>
            </div>
            {data.totalDaysTracked > 0 && (
              <div className="bg-accent/30 rounded-xl px-3 py-2 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Puntaje promedio</span>
                <span className="text-sm font-semibold">{data.avgScore}%</span>
              </div>
            )}
          </div>

          <div className="space-y-2 pt-1">
            <Button
              className="w-full h-11 rounded-xl font-medium"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  await resumeCycleAction();
                  router.refresh();
                })
              }
            >
              <Play className="h-4 w-4 mr-2" />
              {isPending ? "Retomando..." : "Retomar desde donde quedé"}
            </Button>
            <Button
              variant="ghost"
              className="w-full h-10 rounded-xl text-muted-foreground text-sm"
              onClick={() => setShowModal(false)}
            >
              Mantener pausa
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
