"use client";

import { SignOutButton } from "@clerk/nextjs";

export type AccountTab =
  | "profile"
  | "subscription"
  | "billing"
  | "support"
  | "security";

type AccountSidebarProps = {
  email: string;
  isPro: boolean;
  activeTab: AccountTab;
  onTabChange: (tab: AccountTab) => void;
};

const tabs: {
  id: AccountTab;
  label: string;
  description: string;
}[] = [
  {
    id: "profile",
    label: "Profile",
    description: "Identity and account details",
  },
  {
    id: "subscription",
    label: "Subscription",
    description: "Plan and access management",
  },
  {
    id: "billing",
    label: "Billing",
    description: "Payments and invoices",
  },
  {
    id: "support",
    label: "Support",
    description: "Help and contact",
  },
  {
    id: "security",
    label: "Security",
    description: "Account protection",
  },
];

export default function AccountSidebar({
  email,
  isPro,
  activeTab,
  onTabChange,
}: AccountSidebarProps) {
  return (
    <aside className="rounded-[2rem] border border-zinc-800 bg-black/40 p-4 md:p-6">
      <div className="mb-4 rounded-3xl border border-zinc-800 bg-black p-5">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-600">
          Account
        </p>

        <p className="mt-3 text-sm font-bold text-white max-md:[overflow-wrap:anywhere] md:truncate">
          {email}
        </p>

        <div
          className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-bold ${
            isPro
              ? "bg-emerald-500/10 text-emerald-300"
              : "bg-zinc-800 text-zinc-400"
          }`}
        >
          {isPro ? "Pro Membership" : "Free Access"}
        </div>
      </div>

      <nav className="space-y-2 max-md:grid max-md:grid-cols-2 max-md:gap-1.5 max-md:space-y-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            aria-current={activeTab === tab.id ? "true" : undefined}
            className={`w-full rounded-2xl px-4 py-3 text-left transition max-md:min-w-0 max-md:px-2.5 md:px-5 md:py-4 ${
              activeTab === tab.id
                ? "bg-white text-black"
                : "text-zinc-400 hover:bg-black hover:text-white"
            }`}
          >
            <p className="font-bold">{tab.label}</p>

            <p
              className={`mt-1 text-xs leading-5 ${
                activeTab === tab.id
                  ? "text-zinc-700"
                  : "text-zinc-600"
              }`}
            >
              {tab.description}
            </p>
          </button>
        ))}
      </nav>

      <SignOutButton redirectUrl="/">
        <button className="mt-8 w-full max-md:mt-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-left text-sm font-bold text-red-300 transition hover:border-red-400 hover:bg-red-500/20">
          Sign Out
        </button>
      </SignOutButton>
    </aside>
  );
}