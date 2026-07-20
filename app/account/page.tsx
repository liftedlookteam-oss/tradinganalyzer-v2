"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import InfoCard from "../components/account/InfoCard";
import SectionHeader from "../components/account/SectionHeader";
import AccountView from "../components/account/AccountView";
import AccountSidebar, {
  type AccountTab,
} from "../components/account/AccountSidebar";
import ProfileSection from "../components/account/ProfileSection";
import SubscriptionSection from "../components/account/SubscriptionSection";
import BillingSection from "../components/account/BillingSection";
import SupportSection from "../components/account/SupportSection";
import SecuritySection from "../components/account/SecuritySection";
import AccountHeader from "../components/account/AccountHeader";

type AccountStatus = {
  isPro: boolean;
  canAnalyze: boolean;
  remainingHours?: number;
  remainingMinutes?: number;
};

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
    <main className="min-h-screen bg-[#050505] px-4 py-5 text-white md:px-6 md:py-10">
      <div className="mx-auto max-w-7xl">
        <AccountHeader email={email} />

        <div className="grid gap-5 lg:grid-cols-[280px_1fr] lg:gap-8">
<AccountSidebar
  email={email}
  isPro={Boolean(status?.isPro)}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>

          <section className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-4 md:p-8">
            {activeTab === "profile" && (
  <ProfileSection email={email} />
)}

            {activeTab === "subscription" && (
  <SubscriptionSection
    status={status}
    loadingPortal={loadingPortal}
    openBillingPortal={openBillingPortal}
  />
)}

            {activeTab === "billing" && (
  <BillingSection
    status={status}
    loadingPortal={loadingPortal}
    openBillingPortal={openBillingPortal}
  />
)}

            {activeTab === "support" && (
  <SupportSection />
)}

            {activeTab === "security" && (
  <SecuritySection />
)}
          </section>
        </div>
      </div>
    </main>
  );
}