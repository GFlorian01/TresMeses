"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createCycleAction } from "@/app/(app)/settings/actions";
import { CalendarDays, Rocket } from "lucide-react";
import type { Cycle } from "@/types/database";

export function CycleForm({ activeCycle }: { activeCycle: Cycle | null }) {
  if (activeCycle) {
    return (
      <Card className="card-hover">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            Ciclo activo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-accent/30 px-3 py-2">
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                Inicio
              </p>
              <p className="text-sm font-medium mt-0.5">
                {activeCycle.start_date}
              </p>
            </div>
            <div className="rounded-lg bg-accent/30 px-3 py-2">
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                Fin
              </p>
              <p className="text-sm font-medium mt-0.5">
                {activeCycle.end_date}
              </p>
            </div>
          </div>
          {activeCycle.goals.length > 0 && (
            <div className="space-y-1.5 pt-1">
              {activeCycle.goals.map((goal, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-primary mt-0.5">●</span>
                  <span className="text-muted-foreground">{goal}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <Card className="card-hover overflow-hidden relative">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-chart-2" />
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Rocket className="h-4 w-4 text-primary" />
          Iniciar ciclo de 12 semanas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={createCycleAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="startDate" className="text-sm">
              Fecha de inicio
            </Label>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              defaultValue={today}
              required
              className="bg-accent/30 border-0 focus-visible:ring-1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="goals" className="text-sm">
              Metas (una por linea)
            </Label>
            <Textarea
              id="goals"
              name="goals"
              placeholder={
                "Bajar al 15% de grasa corporal\nSeguir mi rutina diaria sin fallo"
              }
              rows={4}
              required
              className="bg-accent/30 border-0 focus-visible:ring-1 resize-none"
            />
          </div>
          <Button type="submit" className="w-full h-11 rounded-xl font-medium">
            Iniciar ciclo
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
