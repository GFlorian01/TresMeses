"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTodayStr, DEFAULT_TIMEZONE } from "@/lib/date-utils";

export async function completeOnboardingAction(data: {
  goals: string[];
  activeHabitIds: string[];
  customHabits: { name: string; icon: string }[];
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { goals, activeHabitIds, customHabits } = data;

  // 1. Fetch user timezone
  const { data: userRow } = await supabase
    .from("users")
    .select("timezone")
    .eq("id", user.id)
    .single();
  const tz = userRow?.timezone ?? DEFAULT_TIMEZONE;
  const today = getTodayStr(tz);

  // 2. Deactivate habits NOT selected by the user
  const { data: allHabits } = await supabase
    .from("habits")
    .select("id")
    .eq("user_id", user.id);

  const toDeactivate = (allHabits ?? [])
    .filter((h) => !activeHabitIds.includes(h.id))
    .map((h) => h.id);

  if (toDeactivate.length > 0) {
    await supabase
      .from("habits")
      .update({ is_active: false })
      .in("id", toDeactivate);
  }

  // 3. Insert custom habits
  if (customHabits.length > 0) {
    const { data: existing } = await supabase
      .from("habits")
      .select("sort_order")
      .eq("user_id", user.id)
      .order("sort_order", { ascending: false })
      .limit(1);
    const nextOrder = (existing?.[0]?.sort_order ?? 4) + 1;

    await supabase.from("habits").insert(
      customHabits.map((h, i) => ({
        user_id: user.id,
        name: h.name,
        icon: h.icon || null,
        sort_order: nextOrder + i,
        is_active: true,
      }))
    );
  }

  // 4. Deactivate any previous active cycles
  await supabase
    .from("cycles")
    .update({ is_active: false })
    .eq("user_id", user.id)
    .eq("is_active", true);

  // 5. Create new cycle starting today
  const endDate = new Date(today + "T12:00:00");
  endDate.setDate(endDate.getDate() + 83);

  await supabase.from("cycles").insert({
    user_id: user.id,
    start_date: today,
    end_date: endDate.toISOString().split("T")[0],
    goals,
  });

  // 6. Mark onboarding complete (last — so any earlier failure leaves user retryable)
  await supabase
    .from("users")
    .update({ onboarding_complete: true })
    .eq("id", user.id);

  redirect("/check");
}
