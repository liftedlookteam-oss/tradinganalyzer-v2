"use client";

import type { DashboardViewProps } from "./DashboardView";
import BalanceModal from "./BalanceModal";
import DashboardHeader from "./DashboardHeader";
import DashboardStats from "./DashboardStats";
import DayTradesModal from "./DayTradesModal";
import TradeModal from "./TradeModal";
import TradingCalendar from "./TradingCalendar";
import WeekSummaryList from "./WeekSummaryList";

export default function DesktopDashboard(props: DashboardViewProps) {
  return (
    <>
      <main className="min-h-screen bg-[#050505] px-4 py-5 text-white md:px-6 md:py-10">
        {props.loadError && (
          <div role="alert" className="mx-auto max-w-7xl px-4 py-3 text-red-300">
            {props.loadError} <button onClick={props.onRetry} className="underline">Retry</button>
          </div>
        )}

        <div className="mx-auto max-w-7xl">
          <DashboardHeader
            onOpenTrade={props.onOpenTradeModal}
            onOpenBalance={props.onOpenBalanceModal}
            onPrepareBalance={() => {
              props.onBalanceDraftChange(props.startingBalance);
              props.onCurrencyDraftChange(props.currency);
            }}
          />

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

          <section className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_0.7fr]">
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

            <WeekSummaryList
              weekSummaries={props.weekSummaries}
              currency={props.currency}
              formatMoney={props.formatMoney}
            />
          </section>
        </div>
      </main>

      <TradeModal
        editing={props.editingTrade}
        date={props.tradeDate}
        onDateChange={props.onTradeDateChange}
        error={props.tradeError}
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
        error={props.balanceError}
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
        error={props.dayError}
        deleting={props.deletingTrade}
        onEdit={(trade) => {
          props.onCloseDayTradesModal();
          props.onEditTrade(trade);
        }}
        onDelete={props.onDeleteTrade}
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