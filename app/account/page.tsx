"use client";

import { SignOutButton, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

type AccountTab =
  | "profile"
  | "subscription"
  | "billing"
  | "support"
  | "security";

type AccountStatus = {
  isPro: boolean;
  canAnalyze: boolean;
  remainingHours?: number;
  remainingMinutes?: number;
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

export default function AccountPage() {
  const { user, isLoaded, isSignedIn } = useUser();

  const [activeTab, setActiveTab] =
    useState<AccountTab>("profile");

  const [status, setStatus] =
    useState<AccountStatus | null>(null);

  const [loadingPortal, setLoadingPortal] =
    useState(false);

  useEffect(() => {
    async function loadStatus() {
      try {
        const response = await fetch("/api/usage");
        const data = await response.json();

        if (response.ok) {
          setStatus(data);
        }
      } catch {}
    }

    if (isSignedIn) {
      loadStatus();
    }
  }, [isSignedIn]);

  async function openBillingPortal() {
    setLoadingPortal(true);

    try {
      const response = await fetch(
        "/api/billing-portal",
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Billing portal failed.");
        return;
      }

      window.location.href = data.url;
    } catch {
      alert("Billing portal failed.");
    } finally {
      setLoadingPortal(false);
    }
  }

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-[#050505]" />
    );
  }

  if (!isSignedIn) {
    window.location.href = "/sign-in";
    return null;
  }

  const email =
    user?.primaryEmailAddress?.emailAddress ||
    "No email";

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-zinc-500">
              Account Center
            </p>

            <h1 className="text-5xl font-bold tracking-tight">
              Manage Account
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              className="rounded-2xl border border-zinc-700 bg-zinc-950 px-5 py-3 text-sm font-bold text-zinc-200 transition hover:border-white hover:text-white"
            >
              Back to Analyzer
            </a>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-700 text-sm font-bold text-white">
  {email.slice(0, 1).toUpperCase()}
</div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="h-fit rounded-[2rem] border border-zinc-800 bg-zinc-950 p-4">
            <div className="mb-4 rounded-3xl border border-zinc-800 bg-black p-5">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-600">
                Account
              </p>

              <p className="mt-3 truncate text-sm font-bold text-white">
                {email}
              </p>

              <div
                className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                  status?.isPro
                    ? "bg-emerald-500/10 text-emerald-300"
                    : "bg-zinc-800 text-zinc-400"
                }`}
              >
                {status?.isPro
                  ? "Pro Membership"
                  : "Free Access"}
              </div>
            </div>

            <nav className="space-y-2">
<form action="/sign-out" method="post" className="mt-8">
  <button
    type="submit"
    className="w-full rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-left text-sm font-bold text-red-300 transition hover:border-red-400 hover:bg-red-500/20"
  >
    Sign Out
  </button>
</form>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() =>
                    setActiveTab(tab.id)
                  }
                  className={`w-full rounded-2xl px-4 py-4 text-left transition ${
                    activeTab === tab.id
                      ? "bg-white text-black"
                      : "text-zinc-400 hover:bg-black hover:text-white"
                  }`}
                >
                  <p className="font-bold">
                    {tab.label}
                  </p>

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
          </aside>

          <section className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-8">
            {activeTab === "profile" && (
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
                    Your account is used to store
                    analysis history, manage
                    subscriptions and personalize
                    platform access across devices.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "subscription" && (
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
                        onClick={
                          openBillingPortal
                        }
                        disabled={
                          loadingPortal
                        }
                        className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-zinc-200 disabled:opacity-50"
                      >
                        {loadingPortal
                          ? "Opening..."
                          : "Manage Subscription"}
                      </button>
                    ) : (
                      <a
                        href="/"
                        className="inline-block rounded-2xl bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-zinc-200"
                      >
                        View Plans
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "billing" && (
              <div>
                <SectionHeader
                  title="Billing"
                  description="Manage invoices, payments and subscription changes."
                />

                <div className="grid gap-5 md:grid-cols-2">
                  <InfoCard
                    label="Invoices"
                    value={
                      status?.isPro
                        ? "Available"
                        : "No invoices"
                    }
                  />

                  <InfoCard
                    label="Payment Status"
                    value={
                      status?.isPro
                        ? "Active subscription"
                        : "No active subscription"
                    }
                  />
                </div>

                <div className="mt-6 rounded-3xl border border-zinc-800 bg-black p-7">
                  <h3 className="text-3xl font-bold">
                    Subscription billing
                  </h3>

                  <p className="mt-4 max-w-2xl leading-8 text-zinc-400">
                    Update payment methods,
                    download invoices, change plans
                    or cancel your subscription from
                    the billing portal.
                  </p>

                  <button
                    onClick={openBillingPortal}
                    disabled={
                      !status?.isPro ||
                      loadingPortal
                    }
                    className="mt-6 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-zinc-200 disabled:opacity-40"
                  >
                    {loadingPortal
                      ? "Opening..."
                      : "Open Billing Portal"}
                  </button>
                </div>
              </div>
            )}

            {activeTab === "support" && (
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
                    Contact support for billing
                    questions, subscription changes,
                    account issues or product
                    feedback.
                  </p>

                  <a
                    href="mailto:support@chartsetup.app"
                    className="mt-6 inline-block rounded-2xl bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-zinc-200"
                  >
                    Contact Support
                  </a>
                </div>
              </div>
            )}

            {activeTab === "security" && (
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
                    Your account access, session
                    management and payment handling
                    are protected using modern
                    security standards and encrypted
                    infrastructure.
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-7 border-b border-zinc-800 pb-6">
      <p className="mb-2 text-sm font-bold uppercase tracking-[0.25em] text-zinc-500">
        {title}
      </p>

      <h2 className="text-4xl font-bold">
        {title}
      </h2>

      <p className="mt-3 max-w-2xl leading-7 text-zinc-400">
        {description}
      </p>
    </div>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-black p-6">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-600">
        {label}
      </p>

      <p className="mt-3 text-lg font-bold text-white">
        {value}
      </p>
    </div>
  );
}