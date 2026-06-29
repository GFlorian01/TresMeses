"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function saveWeeklyReview(
  userId: string,
  cycleId: string,
  weekNumber: number,
  data: {
    score: number;
    reflection: string;
    causeAnalysis: string;
    loadAdjustment: string;
  }
) {
  const supabase = await createClient();

  const { error } = await supabase.from("weekly_reviews").upsert(
    {
      user_id: userId,
      cycle_id: cycleId,
      week_number: weekNumber,
      score: data.score,
      reflection: data.reflection,
      cause_analysis: data.causeAnalysis,
      load_adjustment: data.loadAdjustment,
    },
    { onConflict: "cycle_id,week_number" }
  );

  if (error) throw error;
  revalidatePath("/review");
}

export async function restartCycle(userId: string, cycleId: string) {
  const supabase = await createClient();
  await supabase
    .from("cycles")
    .update({ is_active: false })
    .eq("id", cycleId)
    .eq("user_id", userId);

  revalidatePath("/");
  redirect("/onboarding");
}
