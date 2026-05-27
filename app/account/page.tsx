"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

type AccountTab = "profile" | "subscription" | "billing" | "support" | "security";

type AccountStatus = {
  isPro: boolean;
  canAnalyze: boolean;
  remainingHours?: number;
  remainingMinutes?: number;
  remainingSeconds?: number;
};

const tabs: { id: AccountTab; label: string; description: string }[] = [
  {
    id: "profile",
    label: "Profile",
    description: "Account identity and email details.",
  },
  {
    id: "subscription",
    label: "Subscription",
    description: "Plan status and Pro access.",
  },
  {
    id: "billing",
    label: "Billing",
    description: "Invoices, payment method and billing portal.",
  },
  {
    id: "support",
    label: "Support",
    description: "Help, contact and product support.",
  },
  {
    id: "security",
    label: "Security",
    description: "Authentication and account protection.",
  },
];

export default function AccountPage() {
  const { user, isSignedIn } = useUser();

  const [activeTab, setActiveTab] = useState<AccountTab>("profile");
  const [status, setStatus] = useState<AccountStatus | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);

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

    loadStatus();
  }, []);

  async function openBillingPortal() {
    setLoadingPortal(true);

    try {
      const response = await fetch("/api/billing-portal", {
        method: "POST",
      });

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

  if (!isSignedIn) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] px-6 text-white">
        <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-8 text-center">
          <h1 className="text-3xl font-bold">Sign in required</h1>

          <p className="mt-4 text-zinc-400">
            You need to sign in to manage your account.
          </p>

          <a
            href="/sign-in"
            className="mt-6 inline-block rounded-2xl bg-white px-6 py-3 font-bold text-black"
          >
            Sign In
          </a>
        </div>
      </main>
    );
  }

  const email = user?.primaryEmailAddress?.emailAddress || "No email connected";
  const currentTab = tabs.find((tab) => tab.id === activeTab);

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

            <UserButton />
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="h-fit rounded-[2rem] border border-zinc-800 bg-zinc-950 p-4">
            <div className="mb-4 rounded-3xl border border-zinc-800 bg-black p-5">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-600">
                Signed in as
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
                {status?.isPro ? "Pro Active" : "Free Plan"}
              </div>
            </div>

            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full rounded-2xl px-4 py-4 text-left transition ${
                    activeTab === tab.id
                      ? "bg-white text-black"
                      : "text-zinc-400 hover:bg-black hover:text-white"
                  }`}
                >
                  <p className="font-bold">{tab.label}</p>

                  <p
                    className={`mt-1 text-xs leading-5 ${
                      activeTab === tab.id ? "text-zinc-700" : "text-zinc-600"
                    }`}
                  >
                    {tab.description}
                  </p>
                </button>
              ))}
            </nav>
          </aside>

          <section className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-7">
            <div className="mb-7 border-b border-zinc-800 pb-6">
              <p className="mb-2 text-sm font-bold uppercase tracking-[0.25em] text-zinc-500">
                {currentTab?.label}
              </p>

              <h2 className="text-4xl font-bold">
                {getTabTitle(activeTab)}
              </h2>

              <p className="mt-3 max-w-2xl leading-7 text-zinc-400">
                {getTabDescription(activeTab)}
              </p>
            </div>

            {activeTab === "profile" && (
              <ProfileTab email={email} userId={user?.id || "N/A"} />
            )}

            {activeTab === "subscription" && (
              <SubscriptionTab
                status={status}
                onManageSubscription={openBillingPortal}
                loadingPortal={loadingPortal}
              />
            )}

            {activeTab === "billing" && (
              <BillingTab
                isPro={Boolean(status?.isPro)}
                onOpenPortal={openBillingPortal}
                loadingPortal={loadingPortal}
              />
            )}

            {activeTab === "support" && <SupportTab />}

            {activeTab === "security" && <SecurityTab />}
          </section>
        </div>
      </div>
    </main>
  );
}

function getTabTitle(tab: AccountTab) {
  if (tab === "profile") return "Profile details";
  if (tab === "subscription") return "Subscription access";
  if (tab === "billing") return "Billing management";
  if (tab === "support") return "Support center";
  return "Security settings";
}

function getTabDescription(tab: AccountTab) {
  if (tab === "profile") {
    return "View your account identity and connected email address.";
  }

  if (tab === "subscription") {
    return "Check your current plan, usage limits and Pro subscription status.";
  }

  if (tab === "billing") {
    return "Manage invoices, payment method, subscription changes and cancellations through Stripe.";
  }

  if (tab === "support") {
    return "Get help with billing, account access, product questions or analysis issues.";
  }

  return "Your authentication and account security are handled through Clerk.";
}

function ProfileTab({ email, userId }: { email: string; userId: string }) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <InfoCard label="Email Address" value={email} />
      <InfoCard label="Account ID" value={`${userId.slice(0, 14)}...`} />

      <div className="rounded-3xl border border-zinc-800 bg-black p-6 md:col-span-2">
        <h3 className="text-2xl font-bold">Account profile</h3>

        <p className="mt-3 leading-7 text-zinc-400">
          Your profile, email address, connected accounts and authentication
          settings are managed securely through Clerk.
        </p>
      </div>
    </div>
  );
}

function SubscriptionTab({
  status,
  onManageSubscription,
  loadingPortal,
}: {
  status: AccountStatus | null;
  onManageSubscription: () => void;
  loadingPortal: boolean;
}) {
  const isPro = Boolean(status?.isPro);

  return (
    <div className="space-y-5">
      <div className="grid gap-5 md:grid-cols-3">
        <InfoCard
          label="Current Plan"
          value={isPro ? "ChartSetup Pro" : "Free"}
        />

        <InfoCard
          label="Status"
          value={isPro ? "Active" : "Daily free access"}
        />

        <InfoCard
          label="Usage"
          value={
            isPro
              ? "Unlimited analyses"
              : status?.canAnalyze
              ? "1 free analysis available"
              : `Next free analysis in ${status?.remainingHours || 0}h ${
                  status?.remainingMinutes || 0
                }m`
          }
        />
      </div>

      <div
        className={`rounded-3xl border p-7 ${
          isPro
            ? "border-emerald-500/30 bg-emerald-500/10"
            : "border-zinc-800 bg-black"
        }`}
      >
        <p
          className={`mb-3 text-sm font-bold uppercase tracking-[0.25em] ${
            isPro ? "text-emerald-300" : "text-zinc-500"
          }`}
        >
          {isPro ? "Pro Active" : "Free Plan"}
        </p>

        <h3 className="text-3xl font-bold">
          {isPro
            ? "Unlimited analysis is active."
            : "Upgrade to remove daily limits."}
        </h3>

        <p className="mt-4 max-w-2xl leading-8 text-zinc-400">
          {isPro
            ? "You can run unlimited AI chart analyses, access full history and use priority processing."
            : "Free users receive one AI analysis every 24 hours. Pro unlocks unlimited chart analysis."}
        </p>

        <div className="mt-6">
          {isPro ? (
            <button
              onClick={onManageSubscription}
              disabled={loadingPortal}
              className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-zinc-200 disabled:opacity-50"
            >
              {loadingPortal ? "Opening..." : "Manage Subscription"}
            </button>
          ) : (
            <a
              href="/"
              className="inline-block rounded-2xl bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-zinc-200"
            >
              View Pro Plans
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function BillingTab({
  isPro,
  onOpenPortal,
  loadingPortal,
}: {
  isPro: boolean;
  onOpenPortal: () => void;
  loadingPortal: boolean;
}) {
  return (
    <div className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <InfoCard
          label="Invoices"
          value={isPro ? "Available in Stripe" : "No paid invoices yet"}
        />

        <InfoCard
          label="Payment Method"
          value={isPro ? "Manage in Stripe" : "No active payment method"}
        />
      </div>

      <div className="rounded-3xl border border-zinc-800 bg-black p-7">
        <h3 className="text-3xl font-bold">Stripe billing portal</h3>

        <p className="mt-4 max-w-2xl leading-8 text-zinc-400">
          Use the billing portal to update your card, switch plan, view invoices
          or cancel your subscription.
        </p>

        <button
          onClick={onOpenPortal}
          disabled={!isPro || loadingPortal}
          className="mt-6 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loadingPortal ? "Opening..." : "Open Billing Portal"}
        </button>
      </div>
    </div>
  );
}

function SupportTab() {
  return (
    <div className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <InfoCard label="Support Email" value="support@chartsetup.app" />
        <InfoCard label="Typical Response" value="Within 24–48 hours" />
      </div>

      <div className="rounded-3xl border border-zinc-800 bg-black p-7">
        <h3 className="text-3xl font-bold">Need help?</h3>

        <p className="mt-4 max-w-2xl leading-8 text-zinc-400">
          Contact support for billing problems, subscription changes, account
          access issues, product feedback or analysis-related problems.
        </p>

        <a
          href="mailto:support@chartsetup.app"
          className="mt-6 inline-block rounded-2xl bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-zinc-200"
        >
          Contact Support
        </a>
      </div>

      <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-zinc-500">
          Important
        </p>

        <p className="mt-3 leading-7 text-zinc-400">
          ChartSetup Analyzer is a decision-support tool. It does not provide
          financial advice, guaranteed outcomes or trade signals.
        </p>
      </div>
    </div>
  );
}

function SecurityTab() {
  return (
    <div className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <InfoCard label="Authentication" value="Secured by Clerk" />
        <InfoCard label="Payments" value="Processed by Stripe" />
      </div>

      <div className="rounded-3xl border border-zinc-800 bg-black p-7">
        <h3 className="text-3xl font-bold">Security controls</h3>

        <p className="mt-4 max-w-2xl leading-8 text-zinc-400">
          Email, login methods, connected accounts and account security are
          managed through the secure Clerk account menu.
        </p>
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-black p-6">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-600">
        {label}
      </p>

      <p className="mt-3 text-lg font-bold text-white">{value}</p>
    </div>
  );
}