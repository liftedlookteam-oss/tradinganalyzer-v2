"use client";

import { useEffect, useState } from "react";
import DesktopDashboard from "./DesktopDashboard";
import MobileDashboard from "./MobileDashboard";
import type { CalendarCell, Trade } from "./types";

export type WeekSummary = {
  title: string;
  amount: number;
  trades: number;
};

export type DashboardViewProps = {
  currentDate: Date;
  today: Date | null;
  trades: Trade[];
  startingBalance: number;
  currency: string;
  calendarDays: CalendarCell[][];
  tradesByDate: Record<string, Trade[]>;
  weekSummaries: WeekSummary[];
  monthName: string;
  currentBalance: number;
  netPnL: number;
  winRate: number;
  wins: number;
  losses: number;
  breakevens: number;
  selectedDay: Date | null;
  selectedDayTrades: Trade[];
  showTradeModal: boolean;
  showBalanceModal: boolean;
  showDayTradesModal: boolean;
  isSavingTrade: boolean;
  isSavingBalance: boolean;
  asset: string;
  result: "win" | "loss" | "breakeven";
  amount: string;
  notes: string;
  balanceDraft: number;
  currencyDraft: string;
  currencies: string[];
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onOpenTradeModal: () => void;
  onCloseTradeModal: () => void;
  onOpenBalanceModal: () => void;
  onCloseBalanceModal: () => void;
  onOpenDayTrades: (date: Date, tradeCount: number) => void;
  onCloseDayTradesModal: () => void;
  onSaveTrade: () => void;
  onSaveBalance: () => void;
  onAssetChange: (value: string) => void;
  onResultChange: (value: "win" | "loss" | "breakeven") => void;
  onAmountChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onBalanceDraftChange: (value: number) => void;
  onCurrencyDraftChange: (value: string) => void;

  formatMoney: (value: number, currency: string) => string;
  toDateKey: (date: Date) => string;
  getDayClass: (total: number, count: number) => string;
};

export default function DashboardView(props: DashboardViewProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const update = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    update();

    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("resize", update);
    };
  }, []);

  if (isMobile) {
    return <MobileDashboard {...props} />;
  }

  return <DesktopDashboard {...props} />;
}