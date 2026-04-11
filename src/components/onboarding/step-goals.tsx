"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "Bajar de peso",
  "Ir al gym regularmente",
  "Leer un libro por mes",
  "Comer saludable",
  "Dormir mejor",
  "Reducir el estrés",
  "Construir constancia",
  "Mejorar mi energía",
];

interface StepGoalsProps {
  goals: string[];
  onGoalsChange: (goals: string[]) => void;
  onNext: () => void;
}

export function StepGoals({ goals, onGoalsChange, onNext }: StepGoalsProps) {
  const [customInput, setCustomInput] = useState("");

  const toggleSuggestion = (s: string) => {
    if (goals.includes(s)) {
      onGoalsChange(goals.filter((g) => g !== s));
    } else {
      onGoalsChange([...goals, s]);
    }
  };

  const addCustom = () => {
    const trimmed = customInput.trim();
    if (!trimmed || goals.includes(trimmed)) return;
    onGoalsChange([...goals, trimmed]);
    setCustomInput("");
  };

  const removeGoal = (g: string) => onGoalsChange(goals.filter((x) => x !== g));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">¿Cuáles son tus metas?</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Elige lo que quieres lograr en las próximas 12 semanas.
        </p>
      </div>

      {/* Predefined chips */}
      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => toggleSuggestion(s)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm border transition-all duration-150 select-none",
              goals.includes(s)
                ? "bg-primary/15 border-primary/40 text-primary font-medium"
                : "bg-transparent border-border/60 text-muted-foreground hover:border-border hover:text-foreground"
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Custom input */}
      <div className="flex gap-2">
        <Input
          placeholder="Agregar meta personalizada..."
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addCustom();
            }
          }}
          className="text-sm"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={addCustom}
          disabled={!customInput.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Selected goals */}
      {goals.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            Tus metas
          </p>
          <div className="flex flex-wrap gap-2">
            {goals.map((g) => (
              <span
                key={g}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-primary/10 text-primary border border-primary/20"
              >
                {g}
                <button
                  type="button"
                  onClick={() => removeGoal(g)}
                  className="hover:text-primary/60 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      <Button className="w-full" size="lg" onClick={onNext}>
        Siguiente
      </Button>

      {goals.length === 0 && (
        <p className="text-xs text-center text-muted-foreground -mt-2">
          Puedes continuar sin metas y agregarlas después en Configuración.
        </p>
      )}
    </div>
  );
}
