"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Minus, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export function ReadingTracker({
  entryId,
  initialMinutes,
}: {
  entryId: string;
  initialMinutes: number;
}) {
  const [minutes, setMinutes] = useState(initialMinutes);
  const supabase = createClient();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleChange = (newMinutes: number) => {
    const clamped = Math.max(0, newMinutes);
    setMinutes(clamped);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      supabase
        .from("daily_entries")
        .update({ reading_minutes: clamped })
        .eq("id", entryId)
        .then();
    }, 300);
  };

  return (
    <Card className="card-hover">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          Lectura
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <span
              className={cn(
                "text-2xl font-bold tabular-nums transition-colors",
                minutes > 0 ? "text-primary" : "text-muted-foreground"
              )}
            >
              {minutes}
            </span>
            <span className="text-sm text-muted-foreground ml-1">min</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-full"
              disabled={minutes <= 0}
              onClick={() => handleChange(minutes - 5)}
            >
              <Minus className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-full"
              onClick={() => handleChange(minutes + 5)}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-full"
              onClick={() => handleChange(minutes + 15)}
            >
              <span className="text-xs font-medium">+15</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
