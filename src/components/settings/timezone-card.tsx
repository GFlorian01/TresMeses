"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, Check } from "lucide-react";
import { LATIN_TIMEZONES } from "@/lib/date-utils";
import { updateTimezoneAction } from "@/app/(app)/settings/actions";
import { cn } from "@/lib/utils";

export function TimezoneCard({ currentTz }: { currentTz: string }) {
  const [selected, setSelected] = useState(currentTz);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      await updateTimezoneAction(selected);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" />
          Zona horaria
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Selecciona tu zona horaria para que el día cambie correctamente a medianoche local.
        </p>

        <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
          {LATIN_TIMEZONES.map((tz) => (
            <button
              key={tz.value}
              onClick={() => setSelected(tz.value)}
              className={cn(
                "w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center justify-between gap-2",
                selected === tz.value
                  ? "bg-primary/15 text-foreground font-medium"
                  : "hover:bg-muted text-muted-foreground"
              )}
            >
              <span>{tz.label}</span>
              {selected === tz.value && (
                <Check className="h-3.5 w-3.5 text-primary shrink-0" />
              )}
            </button>
          ))}
        </div>

        <Button
          className="w-full"
          onClick={handleSave}
          disabled={isPending || selected === currentTz}
        >
          {saved ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Guardado
            </>
          ) : isPending ? (
            "Guardando..."
          ) : (
            "Guardar zona horaria"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
