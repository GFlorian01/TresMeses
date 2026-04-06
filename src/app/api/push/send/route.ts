import { NextResponse } from "next/server";
import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";
import { getCurrentTimeStr, DEFAULT_TIMEZONE } from "@/lib/date-utils";

export const dynamic = "force-dynamic";

let vapidConfigured = false;

function ensureVapid() {
  if (!vapidConfigured) {
    webpush.setVapidDetails(
      "mailto:noreply@tresmeses.app",
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    );
    vapidConfigured = true;
  }
}

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/** Retorna true si timeStr está dentro de una ventana de 5 min desde currentTime */
function isWithinWindow(currentTime: string, timeStr: string): boolean {
  const [ch, cm] = currentTime.slice(0, 5).split(":").map(Number);
  const [th, tm] = timeStr.slice(0, 5).split(":").map(Number);
  const currentMins = ch * 60 + cm;
  const targetMins = th * 60 + tm;
  return targetMins >= currentMins && targetMins < currentMins + 5;
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  ensureVapid();
  const supabase = getSupabaseAdmin();

  // Obtener todos los usuarios con sus zonas horarias y suscripciones push
  const { data: users } = await supabase
    .from("users")
    .select("id, timezone");

  if (!users || users.length === 0) return NextResponse.json({ sent: 0 });

  // Para cada usuario, calcular su hora local y ver si tiene notificaciones pendientes
  const matchingUserIds: string[] = [];

  for (const u of users) {
    const tz = u.timezone ?? DEFAULT_TIMEZONE;
    const localTime = getCurrentTimeStr(tz); // "HH:MM:SS"

    // Buscar preferencias de este usuario que coincidan con la hora local
    const { data: prefs } = await supabase
      .from("notification_preferences")
      .select("id, time, label")
      .eq("user_id", u.id)
      .eq("enabled", true);

    const match = prefs?.some((p) => isWithinWindow(localTime, p.time));
    if (match) matchingUserIds.push(u.id);
  }

  if (matchingUserIds.length === 0) return NextResponse.json({ sent: 0 });

  // Obtener las suscripciones y preferencias de los usuarios que tienen notificación ahora
  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("*")
    .in("user_id", matchingUserIds);

  if (!subs || subs.length === 0) return NextResponse.json({ sent: 0 });

  let sent = 0;
  const stale: string[] = [];

  for (const sub of subs) {
    const tz = users.find((u) => u.id === sub.user_id)?.timezone ?? DEFAULT_TIMEZONE;
    const localTime = getCurrentTimeStr(tz);

    const { data: prefs } = await supabase
      .from("notification_preferences")
      .select("label, time")
      .eq("user_id", sub.user_id)
      .eq("enabled", true);

    const label =
      prefs?.find((p) => isWithinWindow(localTime, p.time))?.label ??
      "Es hora de registrar tu progreso";

    const payload = JSON.stringify({ title: "TresMeses", body: label, url: "/check" });

    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload
      );
      sent++;
    } catch (err: unknown) {
      const statusCode = (err as { statusCode?: number }).statusCode;
      if (statusCode === 410 || statusCode === 404) stale.push(sub.endpoint);
    }
  }

  if (stale.length > 0) {
    await supabase.from("push_subscriptions").delete().in("endpoint", stale);
  }

  return NextResponse.json({ sent, cleaned: stale.length });
}
