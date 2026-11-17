"use client";

import { useClerk } from "@clerk/nextjs";
import SectionHeader from "./SectionHeader";

export default function SecuritySection() {
  const { openUserProfile } = useClerk();

  return (
    <div>
      <SectionHeader
        title="Security"
        description="Your account access and data protection settings."
      />

      <button type="button" onClick={() => openUserProfile()} className="rounded-xl border border-zinc-700 px-4 py-3">
        Manage sign-in and security
      </button>
    </div>
  );
}
