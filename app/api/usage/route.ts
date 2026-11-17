import { auth } from "@clerk/nextjs/server";
import { hasUnlimitedAnalysis } from "@/lib/analysis-access";
import { supabase } from "@/lib/supabase";

import { freeAnalysisAvailableAt } from "@/lib/analysis-quota";

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

    const { data: subscription, error: subscriptionError } = await supabase
      .from("subscriptions")
      .select("status, stripe_customer_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (subscriptionError) throw subscriptionError;
    const isPro = subscription?.status === "active" || subscription?.status === "trialing";
    const unlimitedAnalysis = isPro || await hasUnlimitedAnalysis();
    const availableAt = unlimitedAnalysis ? 0 : await freeAnalysisAvailableAt(userId);
    const remaining = Math.max(0, Math.ceil((availableAt - Date.now()) / 1000));

    return Response.json({
      canAnalyze: remaining === 0,
      isPro,
      unlimitedAnalysis,
      hasBilling: Boolean(subscription?.stripe_customer_id),
      subscriptionStatus: subscription?.status ?? null,
      availableAt,
      remainingHours: Math.floor(remaining / 3600),
      remainingMinutes: Math.floor(remaining / 60) % 60,
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