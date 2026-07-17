"use client";

import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import DashboardView from "@/app/components/dashboard/DashboardView";

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
const [today, setToday] = useState<Date | null>(null);
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

useEffect(() => {
  const updateToday = () => {
    setToday(new Date());
  };

  updateToday();

  const interval = window.setInterval(updateToday, 60_000);

  return () => {
    window.clearInterval(interval);
  };
}, []);

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
  <DashboardView
    currentDate={currentDate}
    today={today}
    trades={trades}
    startingBalance={startingBalance}
    currency={currency}
    calendarDays={calendarDays}
    tradesByDate={tradesByDate}
    weekSummaries={weekSummaries}
    monthName={monthName}
    currentBalance={currentBalance}
    netPnL={netPnL}
    winRate={winRate}
    wins={wins}
    losses={losses}
    breakevens={breakevens}
    selectedDay={selectedDay}
    selectedDayTrades={selectedDayTrades}
    showTradeModal={showTradeModal}
    showBalanceModal={showBalanceModal}
    showDayTradesModal={showDayTradesModal}
    isSavingTrade={isSavingTrade}
    isSavingBalance={isSavingBalance}
    asset={asset}
    result={result}
    amount={amount}
    notes={notes}
    balanceDraft={balanceDraft}
    currencyDraft={currencyDraft}
    currencies={currencies}
    onPreviousMonth={previousMonth}
    onNextMonth={nextMonth}
    onToday={() => setCurrentDate(new Date())}
    onOpenTradeModal={() => setShowTradeModal(true)}
    onCloseTradeModal={() => setShowTradeModal(false)}
    onOpenBalanceModal={() => {
      setBalanceDraft(startingBalance);
      setCurrencyDraft(currency);
      setShowBalanceModal(true);
    }}
    onCloseBalanceModal={() => setShowBalanceModal(false)}
    onOpenDayTrades={openDayTrades}
    onCloseDayTradesModal={() => setShowDayTradesModal(false)}
    onSaveTrade={saveTrade}
    onSaveBalance={saveBalance}
    onAssetChange={setAsset}
    onResultChange={setResult}
    onAmountChange={setAmount}
    onNotesChange={setNotes}
    onBalanceDraftChange={setBalanceDraft}
    onCurrencyDraftChange={setCurrencyDraft}
    formatMoney={formatMoney}
    toDateKey={toDateKey}
    getDayClass={getDayClass}
  />
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