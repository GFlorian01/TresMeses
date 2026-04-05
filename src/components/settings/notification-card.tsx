"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, BellOff, Plus, Trash2, Loader2, ChevronUp, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface NotificationPref {
  id: string;
  label: string;
  time: string;
  enabled: boolean;
}

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Custom time picker con flechas arriba/abajo
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
      {/* Horas */}
      <div className="flex flex-col items-center">
        <button
          type="button"
          onClick={() => adjustHour(1)}
          className="p-2 text-muted-foreground hover:text-foreground active:text-primary transition-colors touch-manipulation"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
        <span className="text-base font-mono font-semibold tabular-nums w-7 text-center leading-none">
          {String(h).padStart(2, "0")}
        </span>
        <button
          type="button"
          onClick={() => adjustHour(-1)}
          className="p-2 text-muted-foreground hover:text-foreground active:text-primary transition-colors touch-manipulation"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      <span className="text-base font-mono font-semibold text-muted-foreground">:</span>

      {/* Minutos */}
      <div className="flex flex-col items-center">
        <button
          type="button"
          onClick={() => adjustMinute(5)}
          className="p-2 text-muted-foreground hover:text-foreground active:text-primary transition-colors touch-manipulation"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
        <span className="text-base font-mono font-semibold tabular-nums w-7 text-center leading-none">
          {String(m).padStart(2, "0")}
        </span>
        <button
          type="button"
          onClick={() => adjustMinute(-5)}
          className="p-2 text-muted-foreground hover:text-foreground active:text-primary transition-colors touch-manipulation"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function NotificationCard() {
  const [prefs, setPrefs] = useState<NotificationPref[]>([]);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newLabel, setNewLabel] = useState("Recordatorio");
  const [newTime, setNewTime] = useState("08:00");
  const [permissionState, setPermissionState] = useState<
    "default" | "granted" | "denied"
  >("default");

  const supabase = createClient();

  useEffect(() => {
    loadPrefs();
    checkPushState();
  }, []);

  async function loadPrefs() {
    const { data } = await supabase
      .from("notification_preferences")
      .select("*")
      .order("time");
    setPrefs(data ?? []);
    setLoading(false);
  }

  async function checkPushState() {
    if (!("Notification" in window)) return;
    setPermissionState(
      Notification.permission as "default" | "granted" | "denied"
    );
    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setPushEnabled(!!sub);
    }
  }

  async function togglePush() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      alert("Tu navegador no soporta notificaciones push");
      return;
    }
    if (pushEnabled) {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setPushEnabled(false);
    } else {
      const permission = await Notification.requestPermission();
      setPermissionState(permission as "default" | "granted" | "denied");
      if (permission !== "granted") return;
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub.toJSON() }),
      });
      setPushEnabled(true);
    }
  }

  async function addPref() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Ensure seconds are included for DB time type
    const timeWithSeconds = newTime.length === 5 ? `${newTime}:00` : newTime;

    const { data, error } = await supabase
      .from("notification_preferences")
      .insert({ label: newLabel, time: timeWithSeconds, user_id: user.id })
      .select()
      .single();

    if (!error && data) {
      setPrefs((prev) =>
        [...prev, data].sort((a, b) => a.time.localeCompare(b.time))
      );
      setNewLabel("Recordatorio");
      setNewTime("08:00");
    }
  }

  async function removePref(id: string) {
    await supabase.from("notification_preferences").delete().eq("id", id);
    setPrefs((prev) => prev.filter((p) => p.id !== id));
  }

  async function togglePref(id: string, enabled: boolean) {
    await supabase
      .from("notification_preferences")
      .update({ enabled })
      .eq("id", id);
    setPrefs((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled } : p))
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          Notificaciones
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Push toggle */}
        <Button
          variant={pushEnabled ? "default" : "outline"}
          className="w-full"
          onClick={togglePush}
        >
          {pushEnabled ? (
            <>
              <Bell className="h-4 w-4 mr-2" />
              Notificaciones activadas
            </>
          ) : (
            <>
              <BellOff className="h-4 w-4 mr-2" />
              Activar notificaciones
            </>
          )}
        </Button>

        {permissionState === "denied" && (
          <p className="text-xs text-destructive">
            Notificaciones bloqueadas. Activalas en la configuracion de tu
            navegador.
          </p>
        )}

        {/* Horarios existentes */}
        {prefs.length > 0 && (
          <div className="space-y-2">
            {prefs.map((pref) => (
              <div
                key={pref.id}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-xl border transition-opacity",
                  !pref.enabled && "opacity-40"
                )}
              >
                <button
                  className="flex-1 text-left flex items-center gap-3"
                  onClick={() => togglePref(pref.id, !pref.enabled)}
                >
                  <span className="text-sm font-mono font-bold tabular-nums text-primary">
                    {pref.time.slice(0, 5)}
                  </span>
                  <span className="text-sm text-muted-foreground truncate">
                    {pref.label}
                  </span>
                </button>
                <button
                  onClick={() => removePref(pref.id)}
                  className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Agregar nuevo horario */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <TimePicker value={newTime} onChange={setNewTime} />
            <Input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Etiqueta (ej: Rutina matutina)"
              className="flex-1 min-w-0"
            />
          </div>
          <Button variant="outline" className="w-full h-10 gap-2" onClick={addPref}>
            <Plus className="h-4 w-4" />
            Agregar horario
          </Button>
        </div>

        <p className="text-[11px] text-muted-foreground">
          Toca el horario para activar/desactivar. Los minutos cambian de 5 en 5.
        </p>
      </CardContent>
    </Card>
  );
}
