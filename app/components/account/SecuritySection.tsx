"use client";

import InfoCard from "./InfoCard";
import SectionHeader from "./SectionHeader";

export default function SecuritySection() {
  return (
    <div>
      <SectionHeader
        title="Security"
        description="Your account access and data protection settings."
      />

      <div className="grid gap-5 md:grid-cols-2">
        <InfoCard
          label="Authentication"
          value="Protected"
        />

        <InfoCard
          label="Account Status"
          value="Secure"
        />
      </div>

      <div className="mt-6 rounded-3xl border border-zinc-800 bg-black p-7">
        <h3 className="text-3xl font-bold">
          Secure platform access
        </h3>

        <p className="mt-4 max-w-2xl leading-8 text-zinc-400">
          Your account access, session management
          and payment handling are protected using
          modern security standards and encrypted
          infrastructure.
        </p>
      </div>
    </div>
  );
}