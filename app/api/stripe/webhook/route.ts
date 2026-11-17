import Stripe from "stripe";
import { Resend } from "resend";
import { supabase } from "@/lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return Response.json(
        { error: "Missing Stripe signature." },
        { status: 400 }
      );
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const userId =
        session.metadata?.clerk_user_id ||
        session.metadata?.user_id;

      if (!userId) {
        return Response.json(
          { error: "Missing Clerk user id." },
          { status: 400 }
        );
      }

      if (session.mode !== "subscription" || typeof session.subscription !== "string" ||
          typeof session.customer !== "string") {
        return Response.json({ received: true });
      }

      const subscription = await stripe.subscriptions.retrieve(session.subscription);
      const { error: writeError } = await supabase.from("subscriptions").upsert({
        user_id: userId,
        stripe_customer_id: session.customer,
        stripe_subscription_id: subscription.id,
        status: subscription.status,
        price_id: session.metadata?.selected_plan || null,
        updated_at: new Date().toISOString(),
      });

      if (writeError) throw writeError;

      const email = session.customer_details?.email;
      const plan = session.metadata?.selected_plan === "weekly" ? "Weekly" : "Monthly";

      if (email && ["active", "trialing"].includes(subscription.status)) {
        try {
          const { error: emailError } = await resend.emails.send({
            from: "ChartSetup Analyzer <noreply@send.chartsetup.app>",
            to: email,
            subject: "Your ChartSetup Pro subscription is active",
            html: `
              <div style="font-family: Arial, sans-serif; background:#050505; color:#ffffff; padding:32px;">
                <h1>Your Pro subscription is active</h1>
                <p>Thanks for upgrading to ChartSetup Pro.</p>
                <p>Your selected plan: <strong>${plan}</strong></p>
                <p>You now have access to unlimited AI chart analyses.</p>
                <p>You can manage your subscription anytime from your account dashboard.</p>
                <p style="color:#999999; margin-top:32px;">
                  ChartSetup Analyzer is decision-support only and does not provide financial advice.
                </p>
              </div>
            `,
          });

          if (emailError) console.error("Subscription confirmation email failed", emailError.message);
        } catch (emailError) {
          console.error("SUBSCRIPTION_EMAIL_ERROR:", emailError);
        }
      }
    }

    if (event.type === "customer.subscription.deleted" || event.type === "customer.subscription.updated") {
      const eventSubscription = event.data.object;
      const status = event.type === "customer.subscription.deleted"
        ? "canceled"
        : (await stripe.subscriptions.retrieve(eventSubscription.id)).status;

      const { error } = await supabase.from("subscriptions")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("stripe_subscription_id", eventSubscription.id);
      if (error) throw error;
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook failed", error);
    return Response.json(
      { error: "Webhook handling failed." },
      { status: 500 }
    );
  }
}