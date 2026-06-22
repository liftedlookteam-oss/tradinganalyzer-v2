"use client";

import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";

type Trade = {
  id: string;
  asset: string;
  result: "win" | "loss" | "breakeven";
  amount: number;
  notes?: string | null;
  trade_date: string;
};

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function TradingDashboard() {
  const { isLoaded, isSignedIn } = useUser();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [trades, setTrades] = useState<Trade[]>([]);
  const [startingBalance, setStartingBalance] = useState(0);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);

  const [asset, setAsset] = useState("");
  const [result, setResult] = useState<"win" | "loss" | "breakeven">("win");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      window.location.href = "/sign-in";
      return;
    }

    loadDashboard();
  }, [isLoaded, isSignedIn]);

  async function loadDashboard() {
    try {
      const [tradesResponse, accountResponse] = await Promise.all([
        fetch("/api/trades"),
        fetch("/api/trading-account"),
      ]);

      const tradesData = await tradesResponse.json();
      const accountData = await accountResponse.json();

      setTrades(tradesData.trades || []);
      setStartingBalance(Number(accountData.account?.starting_balance || 0));
    } catch {
      console.error("Failed to load dashboard.");
    }
  }

  async function saveTrade() {
    if (!asset.trim() || !amount) return;

    const rawAmount = Math.abs(Number(amount));
    const signedAmount =
      result === "loss" ? -rawAmount : result === "breakeven" ? 0 : rawAmount;

    const response = await fetch("/api/trades", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        asset: asset.trim().toUpperCase(),
        result,
        amount: signedAmount,
        notes,
        trade_date: toDateKey(new Date()),
      }),
    });

    if (!response.ok) {
      alert("Failed to save trade.");
      return;
    }

    setAsset("");
    setResult("win");
    setAmount("");
    setNotes("");
    setShowTradeModal(false);
    loadDashboard();
  }

  async function saveBalance() {
    const response = await fetch("/api/trading-account", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ starting_balance: startingBalance }),
    });

    if (!response.ok) {
      alert("Failed to save balance.");
      return;
    }

    setShowBalanceModal(false);
    loadDashboard();
  }

  const calendarDays = useMemo(() => buildCalendar(currentDate), [currentDate]);

  const tradesByDate = useMemo(() => {
    const map: Record<string, Trade[]> = {};

    for (const trade of trades) {
      if (!map[trade.trade_date]) map[trade.trade_date] = [];
      map[trade.trade_date].push(trade);
    }

    return map;
  }, [trades]);

  const monthName = currentDate.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const netPnL = trades.reduce((sum, trade) => sum + Number(trade.amount), 0);
  const wins = trades.filter((trade) => Number(trade.amount) > 0).length;
  const losses = trades.filter((trade) => Number(trade.amount) < 0).length;
  const totalClosed = wins + losses;
  const winRate = totalClosed > 0 ? Math.round((wins / totalClosed) * 100) : 0;
  const currentBalance = startingBalance + netPnL;

  const weekSummaries = calendarDays.map((week, index) => {
    const weekTrades = week.flatMap((day) =>
      day ? tradesByDate[toDateKey(day)] || [] : []
    );

    const total = weekTrades.reduce(
      (sum, trade) => sum + Number(trade.amount),
      0
    );

    return {
      title: `Week ${index + 1}`,
      amount: total,
      trades: weekTrades.length,
    };
  });

  function previousMonth() {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  }

  function nextMonth() {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-5 text-white md:px-6 md:py-10">
      <div className="mx-auto max-w-7xl">
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

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Account Balance"
            value={formatMoney(currentBalance)}
            subtext={`Starting: ${formatMoney(startingBalance)}`}
          />
          <StatCard
            label="Net P&L"
            value={formatMoney(netPnL)}
            subtext="All logged trades"
          />
          <StatCard
            label="Win Rate"
            value={`${winRate}%`}
            subtext={`${wins} wins / ${losses} losses`}
          />
          <StatCard
            label="Total Trades"
            value={String(trades.length)}
            subtext="Logged trades"
          />
        </section>

        <section className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Trading Calendar</h2>

            <p className="mt-2 text-sm text-zinc-400">
              Green days are profitable. Red days are losing days. Empty days
              stay black.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowBalanceModal(true)}
              className="rounded-2xl border border-zinc-700 bg-zinc-950 px-5 py-3 text-sm font-bold text-zinc-200"
            >
              Set Balance
            </button>

            <button
              onClick={() => setShowTradeModal(true)}
              className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-black"
            >
              + Log Trade
            </button>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_0.7fr]">
          <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-4 md:p-6">
            <div className="mb-6 flex items-center justify-between">
              <button
                onClick={() => setCurrentDate(new Date())}
                className="rounded-xl border border-zinc-700 bg-black px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-zinc-300"
              >
                Today
              </button>

              <div className="flex items-center gap-3 text-sm font-bold text-zinc-300">
                <button
                  onClick={previousMonth}
                  className="rounded-lg border border-zinc-800 px-3 py-2"
                >
                  ←
                </button>

                <span>{monthName}</span>

                <button
                  onClick={nextMonth}
                  className="rounded-lg border border-zinc-800 px-3 py-2"
                >
                  →
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 md:gap-3">
              {days.map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>

            <div className="mt-4 grid gap-2 md:gap-3">
              {calendarDays.map((week, weekIndex) => (
                <div key={weekIndex} className="grid grid-cols-7 gap-2 md:gap-3">
                  {week.map((day, dayIndex) => {
                    if (!day) {
                      return (
                        <div
                          key={dayIndex}
                          className="min-h-[76px] rounded-2xl border border-zinc-900 bg-black md:min-h-[92px]"
                        />
                      );
                    }

                    const key = toDateKey(day);
                    const dayTrades = tradesByDate[key] || [];
                    const dayTotal = dayTrades.reduce(
                      (sum, trade) => sum + Number(trade.amount),
                      0
                    );

                    return (
                      <div
                        key={key}
                        className={`min-h-[76px] rounded-2xl border p-2 text-sm md:min-h-[92px] md:p-3 ${getResultClass(
                          dayTotal,
                          dayTrades.length
                        )}`}
                      >
                        <div className="font-semibold">{day.getDate()}</div>

                        {dayTrades.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-bold">
                              {formatMoney(dayTotal)}
                            </p>
                            <p className="text-[10px] text-zinc-300">
                              {dayTrades.length} trade
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {weekSummaries.map((week) => (
              <SummaryCard
                key={week.title}
                title={week.title}
                amount={formatMoney(week.amount)}
                trades={`${week.trades} trades`}
                value={week.amount}
                hasTrades={week.trades > 0}
              />
            ))}
          </div>
        </section>
      </div>

      {showTradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-5 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] border border-zinc-800 bg-zinc-950 p-6">
            <h2 className="text-3xl font-bold">Log Trade</h2>

            <input
              value={asset}
              onChange={(e) => setAsset(e.target.value)}
              placeholder="Asset e.g. BTCUSD, AAPL"
              className="mt-5 w-full rounded-2xl border border-zinc-800 bg-black px-5 py-4 outline-none"
            />

            <select
              value={result}
              onChange={(e) =>
                setResult(e.target.value as "win" | "loss" | "breakeven")
              }
              className="mt-3 w-full rounded-2xl border border-zinc-800 bg-black px-5 py-4 outline-none"
            >
              <option value="win">Win</option>
              <option value="loss">Loss</option>
              <option value="breakeven">Breakeven</option>
            </select>

            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type="number"
              placeholder="Amount"
              className="mt-3 w-full rounded-2xl border border-zinc-800 bg-black px-5 py-4 outline-none"
            />

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes optional"
              className="mt-3 min-h-[100px] w-full rounded-2xl border border-zinc-800 bg-black px-5 py-4 outline-none"
            />

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setShowTradeModal(false)}
                className="w-full rounded-2xl border border-zinc-700 px-5 py-4 font-bold"
              >
                Cancel
              </button>

              <button
                onClick={saveTrade}
                className="w-full rounded-2xl bg-white px-5 py-4 font-bold text-black"
              >
                Save Trade
              </button>
            </div>
          </div>
        </div>
      )}

      {showBalanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-5 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] border border-zinc-800 bg-zinc-950 p-6">
            <h2 className="text-3xl font-bold">Set Account Balance</h2>

            <p className="mt-3 text-zinc-400">
              Enter your starting account balance. Logged wins and losses will
              update the dashboard balance.
            </p>

            <input
              value={startingBalance}
              onChange={(e) => setStartingBalance(Number(e.target.value))}
              type="number"
              placeholder="Starting balance"
              className="mt-5 w-full rounded-2xl border border-zinc-800 bg-black px-5 py-4 outline-none"
            />

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setShowBalanceModal(false)}
                className="w-full rounded-2xl border border-zinc-700 px-5 py-4 font-bold"
              >
                Cancel
              </button>

              <button
                onClick={saveBalance}
                className="w-full rounded-2xl bg-white px-5 py-4 font-bold text-black"
              >
                Save Balance
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function buildCalendar(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const mondayIndex = (firstDay.getDay() + 6) % 7;

  const weeks: (Date | null)[][] = [];
  let currentWeek: (Date | null)[] = Array(mondayIndex).fill(null);

  for (let day = 1; day <= lastDay.getDate(); day++) {
    currentWeek.push(new Date(year, month, day));

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) currentWeek.push(null);
    weeks.push(currentWeek);
  }

  return weeks;
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatMoney(value: number) {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}$${Math.abs(value).toFixed(2)}`;
}

function getResultClass(total: number, count: number) {
  if (count === 0) return "border-zinc-800 bg-[#0b0b0b] text-zinc-500";
  if (total > 0) return "border-emerald-600/50 bg-emerald-950/40 text-white";
  if (total < 0) return "border-red-600/50 bg-red-950/40 text-white";
  return "border-zinc-700 bg-zinc-900 text-white";
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
  trades,
  value,
  hasTrades,
}: {
  title: string;
  amount: string;
  trades: string;
  value: number;
  hasTrades: boolean;
}) {
  const className = !hasTrades
    ? "border-zinc-800 bg-zinc-950"
    : value > 0
    ? "border-emerald-700/40 bg-emerald-950/30"
    : value < 0
    ? "border-red-700/40 bg-red-950/30"
    : "border-zinc-700 bg-zinc-900";

  return (
    <div className={`rounded-[2rem] border p-5 ${className}`}>
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-500">
        {title}
      </p>
      <p className="mt-5 text-3xl font-bold">{amount}</p>
      <p className="mt-2 text-sm text-zinc-400">{trades}</p>
    </div>
  );
}