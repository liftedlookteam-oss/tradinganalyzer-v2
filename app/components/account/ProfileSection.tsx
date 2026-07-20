"use client";

import InfoCard from "./InfoCard";
import SectionHeader from "./SectionHeader";

type ProfileSectionProps = {
  email: string;
};

export default function ProfileSection({
  email,
}: ProfileSectionProps) {
  return (
    <div>
      <SectionHeader
        title="Profile"
        description="Your account identity and platform access details."
      />

      <div className="grid gap-5 md:grid-cols-2">
        <InfoCard
          label="Email Address"
          value={email}
        />

        <InfoCard
          label="Member Since"
          value="Active user"
        />
      </div>

      <div className="mt-6 rounded-3xl border border-zinc-800 bg-black p-7">
        <h3 className="text-2xl font-bold">
          Trading workspace identity
        </h3>

        <p className="mt-4 max-w-2xl leading-8 text-zinc-400">
          Your account is used to store analysis history,
          manage subscriptions and personalize platform
          access across devices.
        </p>
      </div>
    </div>
  );
}