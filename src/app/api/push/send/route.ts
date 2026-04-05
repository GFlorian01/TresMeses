import { NextResponse } from "next/server";
import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";

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

export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  ensureVapid();
  const supabase = getSupabaseAdmin();

  // Get current time in user's timezone (we use America/Bogota as default)
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Bogota",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const currentTime = formatter.format(now);
  // Format as HH:MM:00 for DB comparison
  const [hours, minutes] = currentTime.split(":");
  const timeStr = `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}:00`;

  // Find enabled preferences matching this time (within 5 min window)
  const { data: prefs } = await supabase
    .from("notification_preferences")
    .select("user_id, label")
    .eq("enabled", true)
    .gte("time", timeStr)
    .lte(
      "time",
      `${hours.padStart(2, "0")}:${String(Math.min(59, parseInt(minutes) + 4)).padStart(2, "0")}:00`
    );

  if (!prefs || prefs.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  const userIds = [...new Set(prefs.map((p) => p.user_id))];

  // Get push subscriptions for those users
  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("*")
    .in("user_id", userIds);

  if (!subs || subs.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  let sent = 0;
  const stale: string[] = [];

  for (const sub of subs) {
    const userPrefs = prefs.filter((p) => p.user_id === sub.user_id);
    const label = userPrefs[0]?.label || "Recordatorio";

    const payload = JSON.stringify({
      title: "TresMeses",
      body: label,
      url: "/check",
    });

    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        payload
      );
      sent++;
    } catch (err: unknown) {
      const statusCode = (err as { statusCode?: number }).statusCode;
      if (statusCode === 410 || statusCode === 404) {
        stale.push(sub.endpoint);
      }
    }
  }

  // Clean up stale subscriptions
  if (stale.length > 0) {
    await supabase.from("push_subscriptions").delete().in("endpoint", stale);
  }

  return NextResponse.json({ sent, cleaned: stale.length });
}
