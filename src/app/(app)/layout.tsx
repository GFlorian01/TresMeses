import { NavBar } from "@/components/nav-bar";
import { PauseOverlay } from "@/components/pause-overlay";
import { createClient } from "@/lib/supabase/server";
import { getActiveCycle, getCyclePauseStats } from "@/lib/queries";
import type { PauseData } from "@/components/pause-overlay";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let pauseData: PauseData | null = null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const cycle = await getActiveCycle(user.id);
      if (cycle?.is_paused && cycle.paused_at) {
        const stats = await getCyclePauseStats(user.id, cycle.start_date, cycle.paused_at);
        const start = new Date(cycle.start_date + "T12:00:00");
        const pausedAt = new Date(cycle.paused_at);
        const elapsedDaysAtPause = Math.max(
          1,
          Math.ceil((pausedAt.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
        );
        const progressAtPause = Math.min(100, Math.round((elapsedDaysAtPause / 84) * 100));

        pauseData = {
          pauseReason: cycle.pause_reason,
          pausedAt: cycle.paused_at,
          elapsedDaysAtPause,
          progressAtPause,
          ...stats,
        };
      }
    }
  } catch {
    // If auth check fails, render without overlay
  }

  return (
    <>
      {children}
      <NavBar />
      {pauseData && <PauseOverlay data={pauseData} />}
    </>
  );
}
