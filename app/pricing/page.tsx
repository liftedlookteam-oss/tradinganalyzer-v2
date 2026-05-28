"use client";

import { useUser } from "@clerk/nextjs";
import { useState } from "react";

export default function PricingPage() {
  const { isSignedIn } = useUser();
  const [loadingPlan, setLoadingPlan] = useState<"weekly" | "monthly" | null>(
    null
  );

  async function startCheckout(plan: "weekly" | "monthly") {
    if (!isSignedIn) {
      window.location.href = "/sign-in";
      return;
    }

    setLoadingPlan(plan);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Checkout failed.");
        return;
      }

      window.location.href = data.url;
    } catch {
      alert("Checkout failed.");
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10 flex items-center justify-between">
          <a
            href="/"
            className="rounded-2xl border border-zinc-700 bg-zinc-950 px-5 py-3 text-sm font-bold text-zinc-200 transition hover:border-white hover:text-white"
          >
            Back to Analyzer
          </a>

          <a
            href="/account"
            className="rounded-2xl border border-zinc-700 bg-zinc-950 px-5 py-3 text-sm font-bold text-zinc-200 transition hover:border-white hover:text-white"
          >
            Account
          </a>
        </header>

        <section className="mb-10 rounded-[2rem] border border-zinc-800 bg-gradient-to-br from-zinc-950 to-black p-8">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-zinc-500">
            ChartSetup Pro
          </p>

          <h1 className="max-w-4xl text-5xl font-bold tracking-tight md:text-6xl">
            Unlimited AI chart analysis for disciplined traders.
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-400">
            Free users get one analysis every 24 hours. Upgrade to remove limits,
            review more setups, and keep your decision process structured.
          </p>
        </section>

        <section className="mb-8 grid gap-5 md:grid-cols-3">
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

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-7">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-zinc-500">
              Free
            </p>

            <div className="mt-5 flex items-end gap-2">
              <p className="text-5xl font-bold">€0</p>
              <p className="mb-2 text-zinc-500">/ day</p>
            </div>

            <p className="mt-5 leading-8 text-zinc-400">
              One AI analysis every 24 hours. Best for testing the workflow and
              checking occasional setups.
            </p>

            <div className="mt-7 space-y-3">
              <PlanItem text="1 analysis every 24h" />
              <PlanItem text="Saved analysis history" />
              <PlanItem text="Core AI decision support" />
            </div>

            <a
              href="/"
              className="mt-8 block rounded-2xl border border-zinc-700 px-5 py-4 text-center font-bold text-zinc-300 transition hover:border-white hover:text-white"
            >
              Continue Free
            </a>
          </div>

          <button
            onClick={() => startCheckout("weekly")}
            className="rounded-[2rem] border border-white bg-white p-7 text-left text-black transition hover:bg-zinc-200"
          >
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-zinc-600">
              Pro Weekly
            </p>

            <div className="mt-5 flex items-end gap-2">
              <p className="text-5xl font-bold">€4.99</p>
              <p className="mb-2 text-zinc-600">/ week</p>
            </div>

            <p className="mt-5 leading-8 text-zinc-700">
              Flexible Pro access for traders who want unlimited analysis without
              committing monthly.
            </p>

            <div className="mt-7 space-y-3">
              <PlanItem dark text="Unlimited analyses" />
              <PlanItem dark text="Full history access" />
              <PlanItem dark text="Priority analysis processing" />
            </div>

            <div className="mt-8 rounded-2xl bg-black px-5 py-4 text-center font-bold text-white">
              {loadingPlan === "weekly" ? "Opening Checkout..." : "Choose Weekly"}
            </div>
          </button>

          <button
            onClick={() => startCheckout("monthly")}
            className="relative rounded-[2rem] border border-white bg-white p-7 text-left text-black transition hover:bg-zinc-200"
          >
            <div className="absolute right-6 top-6 rounded-full bg-black px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-white">
              Best Value
            </div>

            <p className="text-sm font-bold uppercase tracking-[0.25em] text-zinc-600">
              Pro Monthly
            </p>

            <div className="mt-5 flex items-end gap-2">
              <p className="text-5xl font-bold">€14.99</p>
              <p className="mb-2 text-zinc-600">/ month</p>
            </div>

            <p className="mt-5 leading-8 text-zinc-700">
              Best for active traders who review setups regularly and want a
              clean daily workflow.
            </p>

            <div className="mt-7 space-y-3">
              <PlanItem dark text="Unlimited analyses" />
              <PlanItem dark text="Full history access" />
              <PlanItem dark text="Priority analysis processing" />
            </div>

            <div className="mt-8 rounded-2xl bg-black px-5 py-4 text-center font-bold text-white">
              {loadingPlan === "monthly"
                ? "Opening Checkout..."
                : "Choose Monthly"}
            </div>
          </button>
        </section>

        <section className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-zinc-500">
            Important
          </p>

          <p className="mt-3 leading-8 text-zinc-400">
            ChartSetup Analyzer is a decision-support tool. It does not provide
            financial advice, guaranteed outcomes or blind trade signals.
          </p>
        </section>
      </div>
    </main>
  );
}

function FeatureCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="mt-3 leading-7 text-zinc-400">{text}</p>
    </div>
  );
}

function PlanItem({ text, dark = false }: { text: string; dark?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
          dark ? "bg-black text-white" : "bg-white text-black"
        }`}
      >
        ✓
      </div>

      <p className={dark ? "font-semibold text-black" : "text-zinc-300"}>
        {text}
      </p>
    </div>
  );
}