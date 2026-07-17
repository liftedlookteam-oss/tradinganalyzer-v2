"use client";

type DashboardHeaderProps = {
  onOpenBalance: () => void;
  onOpenTrade: () => void;
  onPrepareBalance: () => void;
};

export default function DashboardHeader({
  onOpenBalance,
  onOpenTrade,
  onPrepareBalance,
}: DashboardHeaderProps) {
  return (
    <>
      <header className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-zinc-500">
            Trading Dashboard
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">
            Track your trading performance
          </h1>

          <p className="mt-3 text-sm text-zinc-400 md:text-base">
            Log every trade and keep your dashboard aligned with your real
            account.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            href="/"
            className="rounded-2xl border border-zinc-700 bg-zinc-950 px-5 py-3 text-sm font-bold text-zinc-200"
          >
            Analyzer
          </a>

          <a
            href="/history"
            className="rounded-2xl border border-zinc-700 bg-zinc-950 px-5 py-3 text-sm font-bold text-zinc-200"
          >
            History
          </a>
        </div>
      </header>

      <section className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Trading Calendar</h2>

          <p className="mt-2 text-sm text-zinc-400">
            Green days are profitable. Red days are losing days. Empty days stay
            black.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              onPrepareBalance();
              onOpenBalance();
            }}
            className="rounded-2xl border border-zinc-700 bg-zinc-950 px-5 py-3 text-sm font-bold text-zinc-200"
          >
            Set Balance
          </button>

          <button
            onClick={onOpenTrade}
            className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-black"
          >
            + Log Trade
          </button>
        </div>
      </section>
    </>
  );
}