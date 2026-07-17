"use client";

import SummaryCard from "./SummaryCard";
import type { WeekSummary } from "./DashboardView";

type WeekSummaryListProps = {
  weekSummaries: WeekSummary[];
  currency: string;
  formatMoney: (value: number, currency: string) => string;
};

export default function WeekSummaryList({
  weekSummaries,
  currency,
  formatMoney,
}: WeekSummaryListProps) {
  return (
    <div className="space-y-4">
      {weekSummaries.map((week) => (
        <SummaryCard
          key={week.title}
          title={week.title}
          amount={formatMoney(week.amount, currency)}
          trades={`${week.trades} ${
            week.trades === 1 ? "trade" : "trades"
          }`}
          value={week.amount}
          hasTrades={week.trades > 0}
        />
      ))}
    </div>
  );
}