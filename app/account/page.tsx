"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

type AccountStatus = {
  isPro: boolean;
  canAnalyze: boolean;
  remainingHours?: number;
  remainingMinutes?: number;
  remainingSeconds?: number;
};

export default function AccountPage() {
  const { user, isSignedIn } = useUser();

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

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
            <nav className="space-y-2">
              <AccountNavItem label="Profile" active />
              <AccountNavItem label="Subscription" />
              <AccountNavItem label="Billing" />
              <AccountNavItem label="Support" />
              <AccountNavItem label="Security" />
            </nav>
          </aside>

          <section className="grid gap-6">
            <Card title="Profile">
              <div className="grid gap-4 md:grid-cols-2">
                <InfoBox label="Email" value={email} />
                <InfoBox
                  label="Account ID"
                  value={user?.id ? `${user.id.slice(0, 10)}...` : "N/A"}
                />
              </div>
            </Card>

            <Card title="Subscription">
              <div className="grid gap-4 md:grid-cols-3">
                <InfoBox
                  label="Current Plan"
                  value={status?.isPro ? "ChartSetup Pro" : "Free"}
                />

                <InfoBox
                  label="Status"
                  value={status?.isPro ? "Active" : "Free daily access"}
                />

                <InfoBox
                  label="Usage"
                  value={
                    status?.isPro
                      ? "Unlimited analyses"
                      : status?.canAnalyze
                      ? "1 free analysis available"
                      : `Next free analysis in ${status?.remainingHours || 0}h ${
                          status?.remainingMinutes || 0
                        }m`
                  }
                />
              </div>

              <div className="mt-6 rounded-3xl border border-zinc-800 bg-black p-6">
                <h3 className="text-2xl font-bold">
                  {status?.isPro
                    ? "Your Pro access is active."
                    : "Upgrade to remove daily limits."}
                </h3>

                <p className="mt-3 leading-7 text-zinc-400">
                  {status?.isPro
                    ? "You have unlimited AI chart analyses, full history access, and priority processing."
                    : "Free users receive one AI analysis every 24 hours. Pro unlocks unlimited chart analysis."}
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  {status?.isPro ? (
                    <button
                      onClick={openBillingPortal}
                      disabled={loadingPortal}
                      className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-zinc-200 disabled:opacity-50"
                    >
                      {loadingPortal ? "Opening..." : "Manage Subscription"}
                    </button>
                  ) : (
                    <a
                      href="/"
                      className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-zinc-200"
                    >
                      View Pro Plans
                    </a>
                  )}
                </div>
              </div>
            </Card>

            <Card title="Billing">
              <div className="grid gap-4 md:grid-cols-2">
                <InfoBox
                  label="Invoices"
                  value={
                    status?.isPro
                      ? "Available in billing portal"
                      : "Available after subscribing"
                  }
                />

                <InfoBox
                  label="Payment Method"
                  value={
                    status?.isPro
                      ? "Manage in Stripe billing portal"
                      : "No active payment method"
                  }
                />
              </div>

              <button
                onClick={openBillingPortal}
                disabled={!status?.isPro || loadingPortal}
                className="mt-5 rounded-2xl border border-zinc-700 px-5 py-3 text-sm font-bold text-zinc-300 transition hover:border-white hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loadingPortal ? "Opening..." : "Open Billing Portal"}
              </button>
            </Card>

            <Card title="Support">
              <div className="grid gap-4 md:grid-cols-2">
                <InfoBox
                  label="Support Email"
                  value="support@chartsetup.app"
                />

                <InfoBox
                  label="Typical Response"
                  value="Within 24–48 hours"
                />
              </div>

              <div className="mt-5 rounded-3xl border border-zinc-800 bg-black p-6">
                <h3 className="text-2xl font-bold">
                  Need help with billing or analysis?
                </h3>

                <p className="mt-3 leading-7 text-zinc-400">
                  Contact support for payment issues, account access, subscription
                  questions, or product feedback.
                </p>
              </div>
            </Card>

            <Card title="Security">
              <div className="grid gap-4 md:grid-cols-2">
                <InfoBox label="Authentication" value="Secured by Clerk" />
                <InfoBox label="Payments" value="Processed securely by Stripe" />
              </div>

              <p className="mt-5 leading-7 text-zinc-500">
                Profile, email, and security settings are handled through your
                secure Clerk account menu.
              </p>
            </Card>
          </section>
        </div>
      </div>
    </main>
  );
}

function AccountNavItem({
  label,
  active = false,
}: {
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl px-4 py-3 text-sm font-bold ${
        active
          ? "bg-white text-black"
          : "text-zinc-500 hover:bg-black hover:text-white"
      }`}
    >
      {label}
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
      <h2 className="text-3xl font-bold">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function InfoBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-black p-5">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-600">
        {label}
      </p>

      <p className="mt-3 text-lg font-bold text-white">{value}</p>
    </div>
  );
}