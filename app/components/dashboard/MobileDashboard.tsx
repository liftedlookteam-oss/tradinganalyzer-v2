"use client";

import type { DashboardViewProps } from "./DashboardView";
import BalanceModal from "./BalanceModal";
import DayTradesModal from "./DayTradesModal";
import DashboardStats from "./DashboardStats";
import TradeModal from "./TradeModal";
import TradingCalendar from "./TradingCalendar";
import WeekSummaryList from "./WeekSummaryList";

export default function MobileDashboard(props: DashboardViewProps) {
  return (
    <>
      <main className="min-h-screen bg-[#050505] pb-10 text-white">
        <div className="px-5 pt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
            Trading Dashboard
          </p>

          <h1 className="mt-2 text-4xl font-bold leading-tight">
            Track your trading performance
          </h1>

          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Log every trade and keep your dashboard aligned with your real
            account.
          </p>
        </div>

        <div className="mt-6 px-5">
          <DashboardStats
            currentBalance={props.currentBalance}
            startingBalance={props.startingBalance}
            netPnL={props.netPnL}
            winRate={props.winRate}
            wins={props.wins}
            losses={props.losses}
            breakevens={props.breakevens}
            totalTrades={props.trades.length}
            currency={props.currency}
            formatMoney={props.formatMoney}
          />
        </div>

        <div className="mt-6 space-y-3 px-5">
          <button
            onClick={props.onOpenTradeModal}
            className="w-full rounded-2xl bg-white px-5 py-4 text-base font-bold text-black"
          >
            + Log Trade
          </button>

          <button
            onClick={() => {
              props.onBalanceDraftChange(props.startingBalance);
              props.onCurrencyDraftChange(props.currency);
              props.onOpenBalanceModal();
            }}
            className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-5 py-4 text-base font-bold text-zinc-200"
          >
            Set Balance
          </button>
        </div>

        <div className="mt-8 px-5">
          <TradingCalendar
            today={props.today}
            currentDate={props.currentDate}
            monthName={props.monthName}
            calendarDays={props.calendarDays}
            tradesByDate={props.tradesByDate}
            currency={props.currency}
            onToday={props.onToday}
            onPreviousMonth={props.onPreviousMonth}
            onNextMonth={props.onNextMonth}
            onOpenDayTrades={props.onOpenDayTrades}
            formatMoney={props.formatMoney}
            toDateKey={props.toDateKey}
            getDayClass={props.getDayClass}
          />
        </div>

        <div className="mt-6 px-5">
          <WeekSummaryList
            weekSummaries={props.weekSummaries}
            currency={props.currency}
            formatMoney={props.formatMoney}
          />
        </div>
      </main>

      <TradeModal
        open={props.showTradeModal}
        isSaving={props.isSavingTrade}
        asset={props.asset}
        result={props.result}
        amount={props.amount}
        notes={props.notes}
        onClose={props.onCloseTradeModal}
        onSave={props.onSaveTrade}
        onAssetChange={props.onAssetChange}
        onResultChange={props.onResultChange}
        onAmountChange={props.onAmountChange}
        onNotesChange={props.onNotesChange}
      />

      <BalanceModal
        open={props.showBalanceModal}
        isSaving={props.isSavingBalance}
        balanceDraft={props.balanceDraft}
        currencyDraft={props.currencyDraft}
        currencies={props.currencies}
        onClose={props.onCloseBalanceModal}
        onSave={props.onSaveBalance}
        onBalanceDraftChange={props.onBalanceDraftChange}
        onCurrencyDraftChange={props.onCurrencyDraftChange}
      />

      <DayTradesModal
        open={props.showDayTradesModal}
        selectedDay={props.selectedDay}
        selectedDayTrades={props.selectedDayTrades}
        currency={props.currency}
        formatMoney={props.formatMoney}
        onClose={props.onCloseDayTradesModal}
      />
    </>
  );
}