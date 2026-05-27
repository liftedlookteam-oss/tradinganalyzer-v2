import Stripe from "stripe";
import { supabase } from "@/lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const body = await request.text();

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return Response.json(
      { error: "Missing Stripe signature." },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    return Response.json(
      {
        error: "Invalid webhook signature.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 400 }
    );
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const userId = session.metadata?.clerk_user_id;

      if (!userId) {
        return Response.json(
          { error: "Missing Clerk user id." },
          { status: 400 }
        );
      }

      await supabase.from("subscriptions").upsert({
        user_id: userId,
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: session.subscription as string,
        status: "active",
        price_id: session.metadata?.selected_plan || null,
        updated_at: new Date().toISOString(),
      });
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;

      await supabase
        .from("subscriptions")
        .update({
          status: "canceled",
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", subscription.id);
    }

    if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object as Stripe.Subscription;

      await supabase
        .from("subscriptions")
        .update({
          status: subscription.status,
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", subscription.id);
    }

    return Response.json({ received: true });
  } catch (error) {
    return Response.json(
      {
        error: "Webhook handling failed.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}