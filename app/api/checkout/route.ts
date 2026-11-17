import { auth } from "@clerk/nextjs/server";
import Stripe from "stripe";
import { supabase } from "@/lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const plan = body.plan;

    let priceId = "";

    if (plan === "weekly") {
      priceId = process.env.STRIPE_WEEKLY_PRICE_ID!;
    } else if (plan === "monthly") {
      priceId = process.env.STRIPE_MONTHLY_PRICE_ID!;
    } else {
      return Response.json(
        { error: "Invalid plan." },
        { status: 400 }
      );
    }

    const { data: subscription, error } = await supabase.from("subscriptions")
      .select("status, stripe_customer_id")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    if (subscription && ["active", "trialing", "past_due", "unpaid", "incomplete", "paused"].includes(subscription.status)) {
      return Response.json({ error: "Manage your existing subscription from Account → Billing." }, { status: 409 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",

      payment_method_types: ["card"],

      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],

      customer: subscription?.stripe_customer_id || undefined,
      success_url: new URL("/account?checkout=success", request.url).toString(),
      cancel_url: new URL("/pricing", request.url).toString(),

      metadata: {
        clerk_user_id: userId,
        selected_plan: plan,
      },
    });

    return Response.json({
      url: session.url,
    });
  } catch (error) {
    return Response.json(
      {
        error: "Stripe checkout failed.",
        details:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    );
  }
}