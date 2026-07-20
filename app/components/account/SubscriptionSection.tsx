"use client";

import InfoCard from "./InfoCard";
import SectionHeader from "./SectionHeader";

type SubscriptionStatus = {
  isPro: boolean;
  canAnalyze: boolean;
  remainingHours?: number;
  remainingMinutes?: number;
};

type SubscriptionSectionProps = {
  status: SubscriptionStatus | null;
  loadingPortal: boolean;
  openBillingPortal: () => void;
};

export default function SubscriptionSection({
  status,
  loadingPortal,
  openBillingPortal,
}: SubscriptionSectionProps) {
  return (
    <div>
      <SectionHeader
        title="Subscription"
        description="Manage your active plan and platform access."
      />

      <div className="grid gap-5 md:grid-cols-3">
        <InfoCard
          label="Current Plan"
          value={
            status?.isPro
              ? "ChartSetup Pro"
              : "Free"
          }
        />

        <InfoCard
          label="Status"
          value={
            status?.isPro
              ? "Active"
              : "Limited Access"
          }
        />

        <InfoCard
          label="Usage"
          value={
            status?.isPro
              ? "Unlimited analyses"
              : status?.canAnalyze
              ? "1 free analysis available"
              : `Next analysis in ${
                  status?.remainingHours || 0
                }h ${
                  status?.remainingMinutes || 0
                }m`
          }
        />
      </div>

      <div className="mt-6 rounded-3xl border border-zinc-800 bg-black p-7">
        <h3 className="text-3xl font-bold">
          {status?.isPro
            ? "Your Pro access is active."
            : "Upgrade for unlimited analysis."}
        </h3>

        <p className="mt-4 max-w-2xl leading-8 text-zinc-400">
          {status?.isPro
            ? "You currently have unrestricted access to AI-powered multi-timeframe trading analysis."
            : "Free access includes one AI analysis every 24 hours. Pro removes all analysis limits."}
        </p>

        <div className="mt-6">
          {status?.isPro ? (
            <button
              onClick={openBillingPortal}
              disabled={loadingPortal}
              className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-zinc-200 disabled:opacity-50"
            >
              {loadingPortal
                ? "Opening..."
                : "Manage Subscription"}
            </button>
          ) : (
            <a
              href="/pricing"
              className="inline-block rounded-2xl bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-zinc-200"
            >
              View Plans
            </a>
          )}
        </div>
      </div>
    </div>
  );
}