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

      await supabase.from("subscriptions").upsert({
        user_id: userId,
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: session.subscription as string,
        status: "active",
        price_id: session.metadata?.selected_plan || null,
        updated_at: new Date().toISOString(),
      });

      const email = session.customer_details?.email;
      const plan = session.metadata?.selected_plan || "Pro";

      console.log("RESEND_EMAIL_DEBUG", {
        email,
        plan,
        hasResendKey: Boolean(process.env.RESEND_API_KEY),
      });

      if (email) {
        try {
          console.log("RESEND_SEND_ATTEMPT");

          const emailResult = await resend.emails.send({
            from: "ChartSetup Analyzer <noreply@send.chartsetup.app>",
            to: email,
            subject: "Your ChartSetup Pro subscription is active",
            html: `
              <div style="font-family: Arial, sans-serif; background:#050505; color:#ffffff; padding:32px;">
                <h1>Your Pro subscription is active</h1>
                <p>Thanks for upgrading to ChartSetup Pro.</p>
                <p>Your selected plan: <strong>${plan}</strong></p>
                <p>You now have access to unlimited AI chart analyses, full analysis history, and priority processing.</p>
                <p>You can manage your subscription anytime from your account dashboard.</p>
                <p style="color:#999999; margin-top:32px;">
                  ChartSetup Analyzer is decision-support only and does not provide financial advice.
                </p>
              </div>
            `,
          });

          console.log("RESEND_SEND_RESULT", emailResult);
        } catch (emailError) {
          console.error("SUBSCRIPTION_EMAIL_ERROR:", emailError);
        }
      }
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