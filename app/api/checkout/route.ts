import { auth } from "@clerk/nextjs/server";
import Stripe from "stripe";

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

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",

      payment_method_types: ["card"],

      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],

      success_url: `${request.headers.get(
        "origin"
      )}/?success=true`,

      cancel_url: `${request.headers.get(
        "origin"
      )}/?canceled=true`,

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