"use client";

import type { CalendarCell, Trade } from "./types";

type TradingCalendarProps = {
  today: Date | null;
  currentDate: Date;
  monthName: string;
  calendarDays: CalendarCell[][];
  tradesByDate: Record<string, Trade[]>;
  currency: string;

  onToday: () => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onOpenDayTrades: (date: Date, tradeCount: number) => void;

  formatMoney: (value: number, currency: string) => string;
  toDateKey: (date: Date) => string;
  getDayClass: (total: number, count: number) => string;
};

const days = [
  { mobile: "M", desktop: "Mon" },
  { mobile: "T", desktop: "Tue" },
  { mobile: "W", desktop: "Wed" },
  { mobile: "T", desktop: "Thu" },
  { mobile: "F", desktop: "Fri" },
  { mobile: "S", desktop: "Sat" },
  { mobile: "S", desktop: "Sun" },
];

export default function TradingCalendar({
  today,
  monthName,
  calendarDays,
  tradesByDate,
  currency,
  onToday,
  onPreviousMonth,
  onNextMonth,
  onOpenDayTrades,
  formatMoney,
  toDateKey,
  getDayClass,
}: TradingCalendarProps) {
  return (
    <div className="rounded-[1.75rem] border border-zinc-800 bg-zinc-950 p-3 sm:p-4 md:rounded-[2rem] md:p-6">
      <div className="mb-5 flex items-center justify-between gap-3 md:mb-6">
        <button
          onClick={onToday}
          className="shrink-0 rounded-xl border border-zinc-700 bg-black px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-300 sm:px-4 sm:text-xs sm:tracking-[0.2em]"
        >
          Today
        </button>

        <div className="flex min-w-0 items-center gap-2 text-sm font-bold text-zinc-300 sm:gap-3">
          <button
            onClick={onPreviousMonth}
            aria-label="Previous month"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-black"
          >
            ←
          </button>

          <span className="min-w-0 truncate text-center">
            {monthName}
          </span>

          <button
            onClick={onNextMonth}
            aria-label="Next month"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-black"
          >
            →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-500 sm:gap-2 sm:text-xs sm:tracking-[0.2em] md:gap-3">
        {days.map((day, index) => (
          <div key={`${day.desktop}-${index}`}>
            <span className="sm:hidden">{day.mobile}</span>
            <span className="hidden sm:inline">{day.desktop}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 grid gap-1 sm:mt-4 sm:gap-2 md:gap-3">
        {calendarDays.map((week, weekIndex) => (
          <div
            key={weekIndex}
            className="grid grid-cols-7 gap-1 sm:gap-2 md:gap-3"
          >
            {week.map((cell) => {
              const key = toDateKey(cell.date);
              const dayTrades = tradesByDate[key] || [];
              const isToday =
                today !== null && key === toDateKey(today);

              const dayTotal = dayTrades.reduce(
                (sum, trade) => sum + Number(trade.amount),
                0
              );

              return (
                <button
                  key={key}
                  onClick={() =>
                    onOpenDayTrades(cell.date, dayTrades.length)
                  }
                  disabled={dayTrades.length === 0}
                  className={`min-h-[58px] min-w-0 overflow-hidden rounded-xl border p-1.5 text-left transition sm:min-h-[72px] sm:rounded-2xl sm:p-2 md:min-h-[92px] md:p-3 ${
                    isToday
                      ? "border-blue-400 ring-1 ring-blue-400/70"
                      : getDayClass(dayTotal, dayTrades.length)
                  } ${!cell.inCurrentMonth ? "opacity-45" : ""} ${
                    dayTrades.length > 0
                      ? "cursor-pointer"
                      : "cursor-default"
                  }`}
                >
                  <div className="text-xs font-semibold sm:text-sm">
                    {cell.date.getDate()}
                  </div>

                  {dayTrades.length > 0 && (
                    <div className="mt-1 min-w-0 sm:mt-2">
                      <p className="truncate text-[9px] font-bold leading-tight sm:text-xs">
                        {formatMoney(dayTotal, currency)}
                      </p>

                      <p className="mt-0.5 hidden truncate text-[10px] text-zinc-300 sm:block">
                        {dayTrades.length}{" "}
                        {dayTrades.length === 1 ? "trade" : "trades"}
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
  );
}