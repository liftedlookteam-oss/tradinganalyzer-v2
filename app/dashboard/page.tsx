"use client";

import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import DashboardView from "@/app/components/dashboard/DashboardView";

import type { CalendarCell, Trade } from "@/app/components/dashboard/types";

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
  const [tradeDate, setTradeDate] = useState("");
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [tradeError, setTradeError] = useState("");
  const [dayError, setDayError] = useState("");
  const [deletingTrade, setDeletingTrade] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [balanceError, setBalanceError] = useState("");

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
    setLoadError("");
    try {
      const [tradesResponse, accountResponse] = await Promise.all([
        fetch("/api/trades"),
        fetch("/api/trading-account"),
      ]);

      if (!tradesResponse.ok || !accountResponse.ok) throw new Error("Dashboard request failed");
      const tradesData = await tradesResponse.json();
      const accountData = await accountResponse.json();

      setTrades(tradesData.trades || []);
      setStartingBalance(Number(accountData.account?.starting_balance || 0));
      setCurrency(accountData.account?.currency || "USD");
    } catch {
      setLoadError("Could not load your trading data.");
    }
  }

  function openTrade(trade: Trade | null = null) {
    setEditingTrade(trade);
    setAsset(trade?.asset ?? "");
    setResult(trade?.result ?? "win");
    setAmount(trade ? String(Math.abs(Number(trade.amount))) : "");
    setNotes(trade?.notes ?? "");
    setTradeDate(trade?.trade_date ?? toDateKey(new Date()));
    setTradeError("");
    setShowTradeModal(true);
  }

  async function saveTrade() {
    if (isSavingTrade) return;
    const numericAmount = result === "breakeven" ? 0 : Number(amount);
    if (!asset.trim() || !tradeDate || !Number.isFinite(numericAmount) ||
        (result !== "breakeven" && numericAmount <= 0)) {
      setTradeError("Enter an asset, a date and a positive amount for a win or loss.");
      return;
    }

    setTradeError("");
    setIsSavingTrade(true);
    try {
      const response = await fetch("/api/trades", {
        method: editingTrade ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingTrade?.id, asset, result, amount: numericAmount, notes, trade_date: tradeDate,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save the trade.");
      setTrades((previous) => [data.trade, ...previous.filter((trade) => trade.id !== data.trade.id)]);
      setCurrentDate(new Date(`${tradeDate}T12:00:00`));
      setShowTradeModal(false);
    } catch (error) {
      setTradeError(error instanceof Error ? error.message : "Could not save the trade.");
    } finally {
      setIsSavingTrade(false);
    }
  }

  async function deleteTrade(trade: Trade) {
    if (deletingTrade || !window.confirm(`Delete the ${trade.asset} trade?`)) return;
    setDeletingTrade(true);
    setDayError("");
    try {
      const response = await fetch(`/api/trades?id=${encodeURIComponent(trade.id)}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Delete failed");
      setTrades((previous) => previous.filter((item) => item.id !== trade.id));
    } catch {
      setDayError("Could not delete the trade. Please try again.");
    } finally {
      setDeletingTrade(false);
    }
  }

  async function saveBalance() {
    if (isSavingBalance) return;
    setIsSavingBalance(true);
    setBalanceError("");
    try {
      const response = await fetch("/api/trading-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ starting_balance: balanceDraft, currency: currencyDraft }),
      });
      if (!response.ok) throw new Error("Save failed");
      setStartingBalance(balanceDraft);
      setCurrency(currencyDraft);
      setShowBalanceModal(false);
    } catch {
      setBalanceError("Could not save the balance. Please try again.");
    } finally {
      setIsSavingBalance(false);
    }
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
    setDayError("");
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
    onOpenTradeModal={() => openTrade()}
    onEditTrade={openTrade}
    editingTrade={Boolean(editingTrade)}
    tradeDate={tradeDate}
    onTradeDateChange={setTradeDate}
    tradeError={tradeError}
    dayError={dayError}
    deletingTrade={deletingTrade}
    onDeleteTrade={deleteTrade}
    loadError={loadError}
    onRetry={loadDashboard}
    balanceError={balanceError}
    onCloseTradeModal={() => setShowTradeModal(false)}
    onOpenBalanceModal={() => {
      setBalanceError("");
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