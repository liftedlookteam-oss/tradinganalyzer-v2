"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import FeatureCard from "../components/pricing/FeatureCard";
import PlanCard from "../components/pricing/PlanCard";

export default function PricingPage() {
  const { isSignedIn } = useUser();

  const [loadingPlan, setLoadingPlan] = useState<
    "weekly" | "monthly" | null
  >(null);

  async function startCheckout(plan: "weekly" | "monthly") {
    if (!isSignedIn) {
      window.location.href = "/sign-in?redirect_url=/pricing";
      return;
    }

    try {
      setLoadingPlan(plan);

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();

      if (!response.ok || !data.url) {
        alert(data.error || "Unable to start checkout.");
        return;
      }

      window.location.href = data.url;
    } catch (error) {
      console.error("CHECKOUT_ERROR:", error);
      alert("Unable to start checkout. Please try again.");
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-4 text-white sm:py-5 md:px-6 md:py-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-center sm:justify-between">
          <a
            href="/"
            className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-5 py-3 text-center text-sm font-bold text-zinc-200 transition hover:border-white hover:text-white sm:w-auto"
          >
            Back to Analyzer
          </a>

          <a
            href="/account"
            className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-5 py-3 text-center text-sm font-bold text-zinc-200 transition hover:border-white hover:text-white sm:w-auto"
          >
            Account
          </a>
        </header>

        <section className="mb-6 rounded-[1.5rem] border border-zinc-800 bg-gradient-to-br from-zinc-950 to-black p-5 sm:rounded-[2rem] md:mb-10 md:p-8">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-zinc-500">
            ChartSetup Pro
          </p>

          <h1 className="max-w-4xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-6xl">
            Unlimited AI chart analysis for disciplined traders.
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-6 text-zinc-400 sm:text-base md:mt-6 md:text-lg md:leading-8">
            Free users get one analysis every 24 hours. Upgrade to Pro for
            unlimited analyses and full history access.
          </p>
        </section>

        <section className="mb-6 grid gap-4 sm:grid-cols-2 md:mb-8 lg:grid-cols-3 lg:gap-5">
          <FeatureCard
            title="No blind signals"
            text="The platform focuses on market structure, scenarios and conditions instead of random buy or sell calls."
          />

          <FeatureCard
            title="Multi-timeframe context"
            text="Upload several chart screenshots so the analysis can compare higher-timeframe bias with execution context."
          />

          <FeatureCard
            title="Built for patience"
            text="WAIT and NO TRADE are treated as valid outcomes when there is no clear edge."
          />
        </section>

        <section className="grid gap-4 lg:grid-cols-3 lg:gap-6">
          <PlanCard
            title="Free"
            price="€0"
            period="day"
            description="One AI analysis every 24 hours. Best for testing the workflow and checking occasional setups."
            features={[
              "1 analysis every 24h",
              "Saved analysis history",
              "Core AI decision support",
            ]}
            buttonText="Continue Free"
            href="/"
          />

          <PlanCard
            title="Pro Weekly"
            price="€4.99"
            period="week"
            description="Flexible Pro access for traders who want unlimited analysis without committing monthly."
            features={[
              "Unlimited analyses",
              "Full history access",
              "Priority analysis processing",
            ]}
            buttonText="Choose Weekly"
            onClick={() => startCheckout("weekly")}
            loading={loadingPlan === "weekly"}
            disabled={loadingPlan !== null}
          />

          <PlanCard
            title="Pro Monthly"
            price="€14.99"
            period="month"
            description="Best for active traders who review setups regularly and want a clean daily workflow."
            features={[
              "Unlimited analyses",
              "Full history access",
              "Priority analysis processing",
            ]}
            buttonText="Choose Monthly"
            onClick={() => startCheckout("monthly")}
            loading={loadingPlan === "monthly"}
            disabled={loadingPlan !== null}
            featured
            badge="Best Value"
          />
        </section>

        <section className="mt-6 rounded-[1.5rem] border border-zinc-800 bg-zinc-950 p-5 sm:mt-8 sm:rounded-3xl sm:p-6">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-zinc-500">
            Important
          </p>

          <p className="mt-3 text-sm leading-7 text-zinc-400 sm:text-base sm:leading-8">
            ChartSetup Analyzer is a decision-support tool. It does not provide
            financial advice, guaranteed outcomes or blind trade signals.
          </p>
        </section>
      </div>
    </main>
  );
}