import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { getTodayStr, DEFAULT_TIMEZONE } from "@/lib/date-utils";

export default async function OnboardingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: userRow } = await supabase
    .from("users")
    .select("onboarding_complete, timezone, name")
    .eq("id", user.id)
    .single();

  if (userRow?.onboarding_complete) redirect("/check");

  const { data: habits } = await supabase
    .from("habits")
    .select("id, name, icon")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("sort_order");

  const tz = userRow?.timezone ?? DEFAULT_TIMEZONE;
  const todayStr = getTodayStr(tz);
  const firstName =
    (userRow?.name ?? user.user_metadata?.full_name ?? "")
      .split(" ")[0] ?? "";

  return (
    <OnboardingWizard
      defaultHabits={habits ?? []}
      userName={firstName}
      todayStr={todayStr}
    />
  );
}
