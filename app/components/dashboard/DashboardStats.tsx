"use client";

import StatCard from "./StatCard";

type DashboardStatsProps = {
  currentBalance: number;
  startingBalance: number;
  netPnL: number;
  winRate: number;
  wins: number;
  losses: number;
  breakevens: number;
  totalTrades: number;
  currency: string;
  formatMoney: (value: number, currency: string) => string;
};

export default function DashboardStats({
  currentBalance,
  startingBalance,
  netPnL,
  winRate,
  wins,
  losses,
  breakevens,
  totalTrades,
  currency,
  formatMoney,
}: DashboardStatsProps) {
  return (
    <section className="grid grid-cols-2 gap-4 xl:grid-cols-4"
      <StatCard
        label="Account Balance"
        value={formatMoney(currentBalance, currency)}
        subtext={`Starting: ${formatMoney(startingBalance, currency)}`}
      />

      <StatCard
        label="Net P&L"
        value={formatMoney(netPnL, currency)}
        subtext="All logged trades"
      />

      <StatCard
        label="Win Rate"
        value={`${winRate}%`}
        subtext={`${wins} wins / ${losses} losses / ${breakevens} BE`}
      />

      <StatCard
        label="Total Trades"
        value={String(totalTrades)}
        subtext="Logged trades"
      />
    </section>
  );
}