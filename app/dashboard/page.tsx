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

type CalendarCell = {
  date: Date;
  inCurrentMonth: boolean;
};

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const currencies = ["USD", "EUR", "GBP"];

export default function TradingDashboard() {
  const { isLoaded, isSignedIn } = useUser();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [trades, setTrades] = useState<Trade[]>([]);
  const [startingBalance, setStartingBalance] = useState(0);
  const [currency, setCurrency] = useState("USD");
const [balanceDraft, setBalanceDraft] = useState(0);
const [currencyDraft, setCurrencyDraft] = useState("USD");

  const [showTradeModal, setShowTradeModal] = useState(false);
const [isSavingTrade, setIsSavingTrade] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
const [isSavingBalance, setIsSavingBalance] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [showDayTradesModal, setShowDayTradesModal] = useState(false);

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
      setCurrency(accountData.account?.currency || "USD");
    } catch {
      console.error("Failed to load dashboard.");
    }
  }

  async function saveTrade() {
if (isSavingTrade) return;
setIsSavingTrade(true);
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
  setIsSavingTrade(false);
  return;
}

setAsset("");
setResult("win");
setAmount("");
setNotes("");
setShowTradeModal(false);
setIsSavingTrade(false);
loadDashboard();
  }

  async function saveBalance() {
if (isSavingBalance) return;
setIsSavingBalance(true);
    const response = await fetch("/api/trading-account", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        starting_balance: balanceDraft,
currency: currencyDraft,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      alert(errorData?.error || "Failed to save balance.");
setIsSavingBalance(false);
      return;
    }

    setShowBalanceModal(false);
setIsSavingBalance(false);
loadDashboard();
setStartingBalance(balanceDraft);
setCurrency(currencyDraft);
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
  const breakevens = trades.filter((trade) => Number(trade.amount) === 0).length;
  const totalClosed = wins + losses;
  const winRate = totalClosed > 0 ? Math.round((wins / totalClosed) * 100) : 0;
  const currentBalance = startingBalance + netPnL;

  const weekSummaries = calendarDays.map((week, index) => {
    const weekTrades = week.flatMap((cell) => {
      const key = toDateKey(cell.date);
      return tradesByDate[key] || [];
    });

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

  const selectedDayTrades = useMemo(() => {
    if (!selectedDay) return [];
    return tradesByDate[toDateKey(selectedDay)] || [];
  }, [selectedDay, tradesByDate]);

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

  function openDayTrades(date: Date, tradeCount: number) {
    if (tradeCount === 0) return;
    setSelectedDay(date);
    setShowDayTradesModal(true);
  }

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-5 text-white md:px-6 md:py-10">
      <div className="mx-auto max-w-7xl">
        <style jsx global>{`
          input[type="number"]::-webkit-outer-spin-button,
          input[type="number"]::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }

          input[type="number"] {
            -moz-appearance: textfield;
          }
        `}</style>

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
              onClick={() => {
  setBalanceDraft(startingBalance);
  setCurrencyDraft(currency);
  setShowBalanceModal(true);
}}
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
                  {week.map((cell) => {
                    const key = toDateKey(cell.date);
                    const dayTrades = tradesByDate[key] || [];
const isToday = key === toDateKey(new Date());
                    const dayTotal = dayTrades.reduce(
                      (sum, trade) => sum + Number(trade.amount),
                      0
                    );

                    return (
                      <button
                        key={key}
                        onClick={() => openDayTrades(cell.date, dayTrades.length)}
                        className={`min-h-[76px] rounded-2xl border p-2 text-left text-sm transition md:min-h-[92px] md:p-3 ${
  isToday
    ? "border-blue-400 ring-1 ring-blue-400/70"
    : getDayClass(dayTotal, dayTrades.length)
} ${!cell.inCurrentMonth ? "opacity-45" : ""} ${
  dayTrades.length > 0 ? "cursor-pointer" : "cursor-default"
}`}
                      >
                        <div className="font-semibold">{cell.date.getDate()}</div>

                        {dayTrades.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-bold">
                              {formatMoney(dayTotal, currency)}
                            </p>
                            <p className="text-[10px] text-zinc-300">
                              {dayTrades.length} trade
                            </p>
                          </div>
                        )}
                      </button>
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
                amount={formatMoney(week.amount, currency)}
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
  disabled={isSavingTrade}
  className="w-full rounded-2xl bg-white px-5 py-4 font-bold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
>
  {isSavingTrade ? "Saving..." : "Save Trade"}
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
              Set your real account starting balance and choose the account
              currency.
            </p>

            <input
              value={balanceDraft === 0 ? "" : balanceDraft}
onChange={(e) => setBalanceDraft(Number(e.target.value || 0))}
              type="number"
              placeholder="Starting balance"
              className="mt-5 w-full rounded-2xl border border-zinc-800 bg-black px-5 py-4 outline-none"
            />

            <select
              value={currencyDraft}
onChange={(e) => setCurrencyDraft(e.target.value)}
              className="mt-3 w-full rounded-2xl border border-zinc-800 bg-black px-5 py-4 outline-none"
            >
              {currencies.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <div className="mt-5 flex gap-3">
             <button
  onClick={() => setShowBalanceModal(false)}
  disabled={isSavingBalance}
  className="w-full rounded-2xl border border-zinc-700 px-5 py-4 font-bold transition hover:border-zinc-500 hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-60"
>
  Cancel
</button>

              <button
  onClick={saveBalance}
  disabled={isSavingBalance}
  className="w-full rounded-2xl bg-white px-5 py-4 font-bold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
>
  {isSavingBalance ? "Saving..." : "Save Balance"}
</button>
            </div>
          </div>
        </div>
      )}

      {showDayTradesModal && selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-5 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[2rem] border border-zinc-800 bg-zinc-950 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold">
                  {selectedDay.toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </h2>
                <p className="mt-2 text-zinc-400">
                  Trades logged on this day
                </p>
              </div>

              <button
                onClick={() => setShowDayTradesModal(false)}
                className="rounded-2xl border border-zinc-700 px-4 py-2 text-sm font-bold"
              >
                Close
              </button>
            </div>

            <div className="mt-6 space-y-3">
              {selectedDayTrades.map((trade) => (
                <div
                  key={trade.id}
                  className="rounded-2xl border border-zinc-800 bg-black p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-lg font-bold">{trade.asset}</p>
                      <p className="mt-1 text-sm uppercase tracking-[0.2em] text-zinc-500">
                        {trade.result}
                      </p>
                    </div>

                    <p
                      className={`text-lg font-bold ${
                        Number(trade.amount) > 0
                          ? "text-emerald-400"
                          : Number(trade.amount) < 0
                          ? "text-red-400"
                          : "text-zinc-300"
                      }`}
                    >
                      {formatMoney(Number(trade.amount), currency)}
                    </p>
                  </div>

                  {trade.notes && (
                    <p className="mt-3 text-sm text-zinc-400">{trade.notes}</p>
                  )}
                </div>
              ))}

              {selectedDayTrades.length === 0 && (
                <div className="rounded-2xl border border-zinc-800 bg-black p-5 text-zinc-400">
                  No trades logged for this day.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function buildCalendar(date: Date): CalendarCell[][] {
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const mondayIndex = (firstDay.getDay() + 6) % 7;

  const startDate = new Date(firstDay);
  startDate.setDate(firstDay.getDate() - mondayIndex);

  const sundayIndex = (lastDay.getDay() + 6) % 7;
  const endDate = new Date(lastDay);
  endDate.setDate(lastDay.getDate() + (6 - sundayIndex));

  const weeks: CalendarCell[][] = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    const week: CalendarCell[] = [];

    for (let i = 0; i < 7; i++) {
      week.push({
        date: new Date(current),
        inCurrentMonth: current.getMonth() === month,
      });

      current.setDate(current.getDate() + 1);
    }

    weeks.push(week);
  }

  return weeks;
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getCurrencySymbol(currency: string) {
  switch (currency) {
    case "EUR":
      return "€";
    case "GBP":
      return "£";
    default:
      return "$";
  }
}

function formatMoney(value: number, currency: string) {
  const symbol = getCurrencySymbol(currency);
  const abs = Math.abs(value).toFixed(2);

  if (value < 0) return `-${symbol}${abs}`;
  return `${symbol}${abs}`;
}

function getDayClass(total: number, count: number) {
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
    ? "border-emerald-500/35 bg-emerald-900/35"
    : value < 0
    ? "border-red-500/35 bg-red-900/35"
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