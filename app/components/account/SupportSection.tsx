"use client";

import InfoCard from "./InfoCard";
import SectionHeader from "./SectionHeader";

export default function SupportSection() {
  return (
    <div>
      <SectionHeader
        title="Support"
        description="Get help with platform usage, subscriptions and account access."
      />

      <div className="grid gap-5 md:grid-cols-2">
        <InfoCard
          label="Support Email"
          value="support@chartsetup.app"
        />

        <InfoCard
          label="Response Time"
          value="24–48 hours"
        />
      </div>

      <div className="mt-6 rounded-3xl border border-zinc-800 bg-black p-7">
        <h3 className="text-3xl font-bold">
          Need assistance?
        </h3>

        <p className="mt-4 max-w-2xl leading-8 text-zinc-400">
          Contact support for billing questions,
          subscription changes, account issues or
          product feedback.
        </p>

        <a
          href="mailto:support@chartsetup.app"
          className="mt-6 inline-block rounded-2xl bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-zinc-200"
        >
          Contact Support
        </a>
      </div>
    </div>
  );
}