export default function TradingDashboard() {
  return (
    <main className="min-h-screen bg-[#050505] px-4 py-5 text-white md:px-6 md:py-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-zinc-500">
              Trading Dashboard
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">
              Track your trading performance
            </h1>
            <p className="mt-3 text-sm text-zinc-400 md:text-base">
              Log your wins and losses, review daily results and keep a clean
              overview of your trading performance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              className="rounded-2xl border border-zinc-700 bg-zinc-950 px-5 py-3 text-sm font-bold text-zinc-200 transition hover:border-white hover:text-white"
            >
              Analyzer
            </a>

            <a
              href="/history"
              className="rounded-2xl border border-zinc-700 bg-zinc-950 px-5 py-3 text-sm font-bold text-zinc-200 transition hover:border-white hover:text-white"
            >
              History
            </a>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Net P&L" value="$0" subtext="No trades logged yet" />
          <StatCard label="Win Rate" value="0%" subtext="0 wins / 0 losses" />
          <StatCard label="Total Trades" value="0" subtext="Start logging trades" />
          <StatCard label="Current Streak" value="0" subtext="No streak yet" />
        </section>

        <section className="mt-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Trading Calendar</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Every logged trade will appear on the day it was entered.
            </p>
          </div>

          <button className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-zinc-200">
            + Log Trade
          </button>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_0.7fr]">
          <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-5 md:p-6">
            <div className="mb-6 flex items-center justify-between">
              <button className="rounded-xl border border-zinc-700 bg-black px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-zinc-300">
                Today
              </button>

              <div className="flex items-center gap-3 text-sm font-bold text-zinc-300">
                <button className="rounded-lg border border-zinc-800 px-3 py-2 hover:border-zinc-600">
                  ←
                </button>
                <span>June 2026</span>
                <button className="rounded-lg border border-zinc-800 px-3 py-2 hover:border-zinc-600">
                  →
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-3 text-center text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            <div className="mt-4 grid grid-cols-7 gap-3">
              {Array.from({ length: 35 }).map((_, index) => (
                <div
                  key={index}
                  className="min-h-[92px] rounded-2xl border border-zinc-800 bg-[#0b0b0b] p-3 text-sm text-zinc-500"
                >
                  <div className="font-semibold">{index + 1 <= 30 ? index + 1 : ""}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <SummaryCard title="Week 1" amount="$0" days="0 days" positive />
            <SummaryCard title="Week 2" amount="$0" days="0 days" />
            <SummaryCard title="Week 3" amount="$0" days="0 days" positive />
            <SummaryCard title="Week 4" amount="$0" days="0 days" />
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  subtext,
}: {
  label: string;
  value: string;
  subtext: string;
}) {
  return (
    <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-6">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-500">
        {label}
      </p>
      <p className="mt-4 text-4xl font-bold">{value}</p>
      <p className="mt-3 text-sm text-zinc-400">{subtext}</p>
    </div>
  );
}

function SummaryCard({
  title,
  amount,
  days,
  positive = false,
}: {
  title: string;
  amount: string;
  days: string;
  positive?: boolean;
}) {
  return (
    <div
      className={`rounded-[2rem] border p-5 ${
        positive
          ? "border-emerald-700/40 bg-emerald-950/30"
          : "border-zinc-800 bg-zinc-950"
      }`}
    >
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-500">
        {title}
      </p>
      <p className="mt-5 text-3xl font-bold">{amount}</p>
      <p className="mt-2 text-sm text-zinc-400">{days}</p>
    </div>
  );
}