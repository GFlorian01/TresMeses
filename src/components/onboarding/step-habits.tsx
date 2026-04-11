"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Check, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface HabitItem {
  id: string;
  name: string;
  icon: string | null;
}

interface CustomHabit {
  name: string;
  icon: string;
}

interface StepHabitsProps {
  defaultHabits: HabitItem[];
  activeHabitIds: Set<string>;
  customHabits: CustomHabit[];
  onActiveHabitIdsChange: (ids: Set<string>) => void;
  onCustomHabitsChange: (habits: CustomHabit[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepHabits({
  defaultHabits,
  activeHabitIds,
  customHabits,
  onActiveHabitIdsChange,
  onCustomHabitsChange,
  onNext,
  onBack,
}: StepHabitsProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("");

  const toggleHabit = (id: string) => {
    const next = new Set(activeHabitIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    onActiveHabitIdsChange(next);
  };

  const addCustomHabit = () => {
    const trimmedName = newName.trim();
    if (!trimmedName) return;
    onCustomHabitsChange([...customHabits, { name: trimmedName, icon: newIcon.trim() }]);
    setNewName("");
    setNewIcon("");
    setShowAddForm(false);
  };

  const removeCustom = (i: number) => {
    onCustomHabitsChange(customHabits.filter((_, idx) => idx !== i));
  };

  const totalActive = activeHabitIds.size + customHabits.length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Tu rutina diaria</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Estos son los hábitos que marcarás cada día. Desactiva los que no aplican.
        </p>
      </div>

      {/* Default habits */}
      <div className="space-y-2">
        {defaultHabits.map((habit) => {
          const isActive = activeHabitIds.has(habit.id);
          return (
            <button
              key={habit.id}
              type="button"
              onClick={() => toggleHabit(habit.id)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-150 text-left select-none",
                isActive
                  ? "bg-primary/10 border-primary/30"
                  : "bg-transparent border-border/40 opacity-50"
              )}
            >
              <span className="flex items-center gap-3 text-sm font-medium">
                {habit.icon && <span className="text-base">{habit.icon}</span>}
                <span className={isActive ? "" : "text-muted-foreground"}>{habit.name}</span>
              </span>
              <span
                className={cn(
                  "flex items-center justify-center w-5 h-5 rounded-full border transition-colors",
                  isActive
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-border/60"
                )}
              >
                {isActive && <Check className="h-3 w-3" />}
              </span>
            </button>
          );
        })}
      </div>

      {/* Custom habits added this session */}
      {customHabits.map((h, i) => (
        <div
          key={i}
          className="flex items-center justify-between px-4 py-3 rounded-xl border border-primary/30 bg-primary/10"
        >
          <span className="flex items-center gap-3 text-sm font-medium">
            {h.icon && <span className="text-base">{h.icon}</span>}
            {h.name}
          </span>
          <button
            type="button"
            onClick={() => removeCustom(i)}
            className="text-muted-foreground hover:text-foreground text-xs"
          >
            Quitar
          </button>
        </div>
      ))}

      {/* Add custom habit */}
      {showAddForm ? (
        <div className="space-y-2 p-4 rounded-xl border border-border/60 bg-accent/20">
          <div className="flex gap-2">
            <Input
              placeholder="Emoji (opcional)"
              value={newIcon}
              onChange={(e) => setNewIcon(e.target.value)}
              className="w-24 text-center text-sm"
              maxLength={4}
            />
            <Input
              placeholder="Nombre del hábito"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomHabit();
                }
              }}
              className="text-sm"
              autoFocus
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              onClick={addCustomHabit}
              disabled={!newName.trim()}
              className="flex-1"
            >
              Agregar
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => { setShowAddForm(false); setNewName(""); setNewIcon(""); }}
            >
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="w-full flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-border/60 text-sm text-muted-foreground hover:text-foreground hover:border-border transition-colors"
        >
          <Plus className="h-4 w-4" />
          Agregar hábito personalizado
        </button>
      )}

      {totalActive === 0 && (
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <p className="text-xs">Sin hábitos activos no habrá nada que registrar diariamente.</p>
        </div>
      )}

      <div className="flex gap-3">
        <Button type="button" variant="ghost" size="lg" onClick={onBack} className="flex-1">
          Atrás
        </Button>
        <Button type="button" size="lg" onClick={onNext} className="flex-[2]">
          Siguiente
        </Button>
      </div>
    </div>
  );
}
