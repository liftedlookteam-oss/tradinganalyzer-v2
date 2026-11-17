"use client";

import InfoCard from "./InfoCard";
import SectionHeader from "./SectionHeader";

type BillingStatus = {
  isPro: boolean;
  hasBilling: boolean;
  subscriptionStatus: string | null;
};

type BillingSectionProps = {
  status: BillingStatus | null;
  loadingPortal: boolean;
  openBillingPortal: () => void;
};

export default function BillingSection({
  status,
  loadingPortal,
  openBillingPortal,
}: BillingSectionProps) {
  return (
    <div>
      <SectionHeader
        title="Billing"
        description="Manage invoices, payments and subscription changes."
      />

      <div className="grid gap-5 md:grid-cols-2">
        <InfoCard
          label="Invoices"
          value={status?.hasBilling ? "View in billing portal" : "No billing account"}
        />

        <InfoCard
          label="Payment Status"
          value={
            status?.isPro
              ? "Active subscription"
              : status?.subscriptionStatus?.replaceAll("_", " ") ?? "No active subscription"
          }
        />
      </div>

      <div className="mt-6 rounded-3xl border border-zinc-800 bg-black p-7">
        <h3 className="text-3xl font-bold">
          Subscription billing
        </h3>

        <p className="mt-4 max-w-2xl leading-8 text-zinc-400">
          Update payment methods, download invoices, change
          plans or cancel your subscription from the billing
          portal.
        </p>

        <button
          onClick={openBillingPortal}
          disabled={!status?.hasBilling || loadingPortal}
          className="mt-6 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-zinc-200 disabled:opacity-40"
        >
          {loadingPortal
            ? "Opening..."
            : "Open Billing Portal"}
        </button>
      </div>
    </div>
  );
}