import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";

function getRemainingTime(lastUsed: string) {
  const last = new Date(lastUsed).getTime();
  const now = Date.now();

  const remaining = 24 * 60 * 60 * 1000 - (now - last);

  if (remaining <= 0) {
    return null;
  }

  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor(
    (remaining % (1000 * 60 * 60)) / (1000 * 60)
  );

  return {
    hours,
    minutes,
    totalMs: remaining,
  };
}

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json(
        {
          canAnalyze: false,
          reason: "UNAUTHORIZED",
        },
        { status: 401 }
      );
    }

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("status")
      .eq("user_id", userId)
      .maybeSingle();

    const isPro = subscription?.status === "active";

    if (isPro) {
      return Response.json({
        canAnalyze: true,
        isPro: true,
      });
    }

    const { data: usage } = await supabase
      .from("user_usage")
      .select("last_free_analysis_at")
      .eq("user_id", userId)
      .maybeSingle();

    if (!usage?.last_free_analysis_at) {
      return Response.json({
        canAnalyze: true,
        isPro: false,
      });
    }

    const remaining = getRemainingTime(
      usage.last_free_analysis_at
    );

    if (!remaining) {
      return Response.json({
        canAnalyze: true,
        isPro: false,
      });
    }

    return Response.json({
      canAnalyze: false,
      isPro: false,
      remainingHours: remaining.hours,
      remainingMinutes: remaining.minutes,
    });
  } catch (error) {
    return Response.json(
      {
        error: "Usage check failed.",
        details:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    );
  }
}