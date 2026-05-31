"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, ChevronUp, ChevronDown, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { saveEmailPrefsAction } from "@/app/(app)/settings/actions";

interface EmailPrefs {
  morning_enabled: boolean;
  morning_time: string;
  evening_enabled: boolean;
  evening_time: string;
  weekly_enabled: boolean;
  weekly_time: string;
}

function TimePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [h, m] = value.split(":").map(Number);

  function adjustHour(delta: number) {
    const next = ((h + delta + 24) % 24).toString().padStart(2, "0");
    onChange(`${next}:${String(m).padStart(2, "0")}`);
  }

  function adjustMinute(delta: number) {
    const next = ((m + delta + 60) % 60).toString().padStart(2, "0");
    onChange(`${String(h).padStart(2, "0")}:${next}`);
  }

  return (
    <div className="flex items-center gap-1 bg-muted/40 border rounded-xl px-2 py-1">
      <div className="flex flex-col items-center">
        <button type="button" onClick={() => adjustHour(1)} className="p-2 text-muted-foreground hover:text-foreground active:text-primary transition-colors touch-manipulation">
          <ChevronUp className="h-4 w-4" />
        </button>
        <span className="text-base font-mono font-semibold tabular-nums w-7 text-center leading-none">
          {String(h).padStart(2, "0")}
        </span>
        <button type="button" onClick={() => adjustHour(-1)} className="p-2 text-muted-foreground hover:text-foreground active:text-primary transition-colors touch-manipulation">
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
      <span className="text-base font-mono font-semibold text-muted-foreground">:</span>
      <div className="flex flex-col items-center">
        <button type="button" onClick={() => adjustMinute(5)} className="p-2 text-muted-foreground hover:text-foreground active:text-primary transition-colors touch-manipulation">
          <ChevronUp className="h-4 w-4" />
        </button>
        <span className="text-base font-mono font-semibold tabular-nums w-7 text-center leading-none">
          {String(m).padStart(2, "0")}
        </span>
        <button type="button" onClick={() => adjustMinute(-5)} className="p-2 text-muted-foreground hover:text-foreground active:text-primary transition-colors touch-manipulation">
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function EmailRow({
  label,
  sublabel,
  enabled,
  time,
  onToggle,
  onTimeChange,
}: {
  label: string;
  sublabel: string;
  enabled: boolean;
  time: string;
  onToggle: () => void;
  onTimeChange: (v: string) => void;
}) {
  return (
    <div className={cn("border rounded-xl p-3 space-y-3 transition-opacity", !enabled && "opacity-50")}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{sublabel}</p>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "w-11 h-6 rounded-full transition-colors relative",
            enabled ? "bg-primary" : "bg-muted"
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all",
              enabled ? "left-[22px]" : "left-0.5"
            )}
          />
        </button>
      </div>
      {enabled && (
        <div className="flex items-center gap-3">
          <TimePicker value={time} onChange={onTimeChange} />
          <span className="text-xs text-muted-foreground">hora local</span>
        </div>
      )}
    </div>
  );
}

export function EmailCard({
  initialPrefs,
  userEmail,
}: {
  initialPrefs: EmailPrefs | null;
  userEmail: string;
}) {
  const defaults: EmailPrefs = {
    morning_enabled: true,
    morning_time: "08:30",
    evening_enabled: true,
    evening_time: "20:30",
    weekly_enabled: true,
    weekly_time: "21:30",
  };

  const [prefs, setPrefs] = useState<EmailPrefs>({
    morning_enabled: initialPrefs?.morning_enabled ?? defaults.morning_enabled,
    morning_time: (initialPrefs?.morning_time ?? defaults.morning_time).slice(0, 5),
    evening_enabled: initialPrefs?.evening_enabled ?? defaults.evening_enabled,
    evening_time: (initialPrefs?.evening_time ?? defaults.evening_time).slice(0, 5),
    weekly_enabled: initialPrefs?.weekly_enabled ?? defaults.weekly_enabled,
    weekly_time: (initialPrefs?.weekly_time ?? defaults.weekly_time).slice(0, 5),
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    await saveEmailPrefsAction(prefs);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function update(key: keyof EmailPrefs, value: boolean | string) {
    setPrefs((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Mail className="h-4 w-4 text-primary" />
          Correos de progreso
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Se envían a <strong>{userEmail}</strong>
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <EmailRow
          label="Mañana"
          sublabel="Resumen de ayer + motivación del día"
          enabled={prefs.morning_enabled}
          time={prefs.morning_time}
          onToggle={() => update("morning_enabled", !prefs.morning_enabled)}
          onTimeChange={(v) => update("morning_time", v)}
        />
        <EmailRow
          label="Noche"
          sublabel="Resumen del día y pendientes"
          enabled={prefs.evening_enabled}
          time={prefs.evening_time}
          onToggle={() => update("evening_enabled", !prefs.evening_enabled)}
          onTimeChange={(v) => update("evening_time", v)}
        />
        <EmailRow
          label="Domingos — Resumen semanal"
          sublabel="Performance completo de la semana"
          enabled={prefs.weekly_enabled}
          time={prefs.weekly_time}
          onToggle={() => update("weekly_enabled", !prefs.weekly_enabled)}
          onTimeChange={(v) => update("weekly_time", v)}
        />

        <Button
          className="w-full"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : saved ? (
            <Check className="h-4 w-4 mr-2" />
          ) : null}
          {saved ? "Guardado" : "Guardar horarios"}
        </Button>

        <p className="text-[11px] text-muted-foreground">
          Los minutos cambian de 5 en 5. Se envía con ±25 min de tolerancia.
        </p>
      </CardContent>
    </Card>
  );
}
