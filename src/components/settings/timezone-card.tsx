"use client";

import { useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Globe, Check, ChevronDown } from "lucide-react";
import { LATIN_TIMEZONES } from "@/lib/date-utils";
import { updateTimezoneAction } from "@/app/(app)/settings/actions";
import { cn } from "@/lib/utils";

export function TimezoneCard({ currentTz }: { currentTz: string }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(currentTz);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const currentLabel =
    LATIN_TIMEZONES.find((t) => t.value === selected)?.label ?? selected;

  function handleSelect(value: string) {
    setSelected(value);
    setOpen(false);
    startTransition(async () => {
      await updateTimezoneAction(value);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <Card>
      <CardContent className="py-3 px-4">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Globe className="h-4 w-4 text-primary shrink-0" />
            <span className="text-sm font-medium">Zona horaria</span>
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            {saved ? (
              <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
            ) : isPending ? (
              <span className="text-xs text-muted-foreground">...</span>
            ) : null}
            <span className="text-xs text-muted-foreground truncate max-w-[160px]">
              {currentLabel}
            </span>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 text-muted-foreground shrink-0 transition-transform",
                open && "rotate-180"
              )}
            />
          </div>
        </button>

        {open && (
          <div className="mt-3 space-y-0.5 max-h-52 overflow-y-auto -mx-1 px-1">
            {LATIN_TIMEZONES.map((tz) => (
              <button
                key={tz.value}
                onClick={() => handleSelect(tz.value)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between gap-2",
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
        )}
      </CardContent>
    </Card>
  );
}
